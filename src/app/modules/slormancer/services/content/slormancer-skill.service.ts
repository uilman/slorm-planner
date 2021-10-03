import { Injectable } from '@angular/core';

import { Buff } from '../../model/content/buff';
import { DataSkill } from '../../model/content/data/data-skill';
import { AbstractEffectValue, EffectValueSynergy, EffectValueVariable } from '../../model/content/effect-value';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { HeroClass } from '../../model/content/enum/hero-class';
import { MechanicType } from '../../model/content/enum/mechanic-type';
import { SkillCostType } from '../../model/content/enum/skill-cost-type';
import { SkillGenre } from '../../model/content/enum/skill-genre';
import { GameDataSkill } from '../../model/content/game/data/game-data-skill';
import { Mechanic } from '../../model/content/mechanic';
import { Skill } from '../../model/content/skill';
import { SkillClassMechanic } from '../../model/content/skill-class-mechanic';
import { SkillType } from '../../model/content/skill-type';
import { SkillUpgrade } from '../../model/content/skill-upgrade';
import { effectValueSynergy, effectValueVariable } from '../../util/effect-value.util';
import { list, round } from '../../util/math.util';
import {
    emptyStringToNull,
    isEffectValueSynergy,
    isEffectValueVariable,
    isFirst,
    isNotNullOrUndefined,
    splitData,
    splitFloatData,
    valueOrDefault,
    valueOrNull,
} from '../../util/utils';
import { SlormancerBuffService } from './slormancer-buff.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerEffectValueService } from './slormancer-effect-value.service';
import { SlormancerMechanicService } from './slormancer-mechanic.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerSkillService {
   
    /*private readonly BASE_XP: { [key: number]: number } = {
        1: 9065,
        2: 10890,
        3: 24060,
        4: 26940, // 484, 446
        5: 43440,
        6: 70050,


        10: 1508
    }*/

    private readonly RANK_LABEL = this.slormancerTranslateService.translate('tt_rank');
    private readonly MASTERY_LABEL = this.slormancerTranslateService.translate('tt_mastery');
    private readonly COST_LABEL = this.slormancerTranslateService.translate('tt_cost');
    private readonly COOLDOWN_LABEL = this.slormancerTranslateService.translate('tt_cooldown');
    private readonly SECONDS_LABEL = this.slormancerTranslateService.translate('tt_seconds');

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService: SlormancerTranslateService,
                private slormancerMechanicService: SlormancerMechanicService,
                private slormancerDataService: SlormancerDataService,
                private slormancerBuffService: SlormancerBuffService,
                private slormancerEffectValueService: SlormancerEffectValueService) {
    }

    public getSkillLevelFromXp(heroClass: HeroClass, skill: number, experience: number): number {
        // TODO
        return Math.min(15, experience);
    }

    private isDamageStat(stat: string): boolean {
        return stat === 'physical_damage' || stat === 'elemental_damage' || stat === 'bleed_damage';
    }

    private parseEffectValues(data: GameDataSkill, upgradeType: EffectValueUpgradeType): Array<AbstractEffectValue> {
        const valueBases = splitFloatData(data.DESC_VALUE_BASE);
        const valuePerLevels = splitFloatData(data.DESC_VALUE_PER_LVL);
        const valueTypes = emptyStringToNull(splitData(data.DESC_VALUE_TYPE));
        const valueReals = emptyStringToNull(splitData(data.DESC_VALUE_REAL));
        const stats = emptyStringToNull(splitData(data.DESC_VALUE));

        const max = Math.max(valueBases.length, valuePerLevels.length, valueTypes.length);

        let result: Array<AbstractEffectValue> = [];
        for (let i of list(max)) {
            const type = valueOrNull(valueReals[i]);
            const percent = valueOrNull(valueTypes[i]) === '%';
            const value = valueOrDefault(valueBases[i], 0);
            const upgrade = valueOrDefault(valuePerLevels[i], 0);
            const stat = valueOrDefault(stats[i], null);

            if (stat !== null && this.isDamageStat(stat)) {
                result.push(effectValueSynergy(value, upgrade, upgradeType, false, stat, EffectValueValueType.Damage));
            } else if (type === null) {
                result.push(effectValueVariable(value, upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'negative') {
                result.push(effectValueVariable(value, -upgrade, upgradeType, percent, stat, EffectValueValueType.Stat));
            } else if (type === 'every_3') {
                result.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.Every3, percent, stat, EffectValueValueType.Stat));
            } else {
                const typeValues = splitData(type, ':');
                const source = <string>typeValues[1];
                if (typeValues[0] === 'based_on_mastery') {
                    result.push(effectValueSynergy(value * 100, 0, upgradeType, percent, 'based_on_mastery_' + source, stat));
                } else {
                    result.push(effectValueSynergy(value, upgrade, upgradeType, percent, source, stat));
                }
            }
        }
        
        return result;
    }

    private applyOverride(skill: Skill | SkillUpgrade | SkillClassMechanic, overrideData: DataSkill | null) {
    
        if (overrideData !== null) {
            overrideData.override(skill.values);

            if (overrideData.costTypeOverride && (<Skill | SkillUpgrade>skill).costType) {
                (<Skill | SkillUpgrade>skill).costType = overrideData.costTypeOverride;
            }

            if (overrideData.additionalGenres && 'genres' in skill) {
                skill.genres.push(...overrideData.additionalGenres)
            }
        }
    } 

    public getHeroSkill(skillId: number, heroClass: HeroClass, experience: number, bonusLevel: number = 0): Skill | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, skillId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, skillId);
        let skill: Skill | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Support || gameDataSkill.TYPE === SkillType.Active)) {
            skill = {
                id: gameDataSkill.REF,
                type: gameDataSkill.TYPE,
                heroClass,
                level: 0,
                unlockLevel: gameDataSkill.UNLOCK_LEVEL,
                maxLevel: gameDataSkill.UPGRADE_NUMBER,
                baseLevel: Math.min(gameDataSkill.UPGRADE_NUMBER, this.getSkillLevelFromXp(heroClass, skillId, experience)),
                bonusLevel,
                name: gameDataSkill.EN_NAME,
                specialization: null,
                specializationName: null,
                icon: 'assets/img/icon/skill/' + heroClass + '/' + gameDataSkill.REF + '.png',
                iconLarge: 'assets/img/icon/skill/' + heroClass + '/' + gameDataSkill.REF + '_large.png',
                description: '',
                baseCooldown: round(gameDataSkill.COOLDOWN / 60, 2),
                cooldown: 0,
                initialCost: gameDataSkill.COST,
                perLevelCost: gameDataSkill.COST_LEVEL,
                baseCost: 0,
                cost: 0,
                costType: <SkillCostType>gameDataSkill.COST_TYPE,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),

                nameLabel: '',
                genresLabel: null,
                costLabel: null,
                cooldownLabel: null,
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill, EffectValueUpgradeType.Mastery)
            };
    
            this.applyOverride(skill, dataSkill);
            skill.specialization = dataSkill === null ? null : valueOrNull(dataSkill.specialization);
    
            this.updateSkillModel(skill);
            this.updateSkillView(skill);
        }

        return skill;
    }

    public getHeroSkillClone(skill: Skill): Skill {
        return { ...skill,
            genres: [...skill.genres],
            damageTypes: [...skill.damageTypes],
            values: skill.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public updateSkillModel(skill: Skill) {
        skill.level = Math.min(skill.maxLevel, skill.baseLevel) + skill.bonusLevel;
        skill.cooldown = skill.baseCooldown;
        skill.baseCost = skill.initialCost + skill.perLevelCost * skill.level;

        skill.hasLifeCost = skill.costType === SkillCostType.LifeSecond || skill.costType === SkillCostType.LifeLock || skill.costType === SkillCostType.Life;
        skill.hasManaCost = skill.costType === SkillCostType.ManaSecond || skill.costType === SkillCostType.ManaLock || skill.costType === SkillCostType.Mana;
        skill.hasNoCost = skill.costType === SkillCostType.None;
        
        for (const effectValue of skill.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, skill.level);
        }
    }

    public updateSkillView(skill: Skill) {
        if (skill.specialization !== null) {
            const specialization = this.slormancerDataService.getGameDataSpecializationSkill(skill.heroClass, skill.specialization);
            if (specialization !== null) {
                skill.specializationName = specialization.EN_NAME;
            }
        }
        skill.nameLabel = [skill.specializationName, skill.name].filter(isNotNullOrUndefined).join('<br/>');

        skill.genresLabel =  null;
        if (skill.genres.length > 0) {
            skill.genresLabel = skill.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        skill.costLabel = null;
        if (!skill.hasNoCost) {
            skill.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(skill.cost.toString(), skill.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translate(skill.costType);
        }

        skill.cooldownLabel = null;
        if (skill.baseCooldown > 0) {
            skill.cooldownLabel = this.COOLDOWN_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(skill.cooldown.toString(), 'value')
                + ' ' + this.SECONDS_LABEL;
        }
        
        skill.description = this.slormancerTemplateService.formatSkillDescription(skill.template, skill.values);
    }

    public getClassMechanicClone(mechanic: SkillClassMechanic): SkillClassMechanic {
        return {
            ...mechanic,
            values: mechanic.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getMechanicClone(mechanic: Mechanic): Mechanic {
        return { ...mechanic };
    }

    public getBuffClone(buff: Buff): Buff {
        return { ...buff };
    }

    public getUpgradeClone(upgrade: SkillUpgrade): SkillUpgrade {
        return { ...upgrade,
            genres: [...upgrade.genres],
            damageTypes: [...upgrade.damageTypes],
            nextRankDescription: [...upgrade.nextRankDescription],
            maxRankDescription: [...upgrade.maxRankDescription],

            relatedClassMechanics: upgrade.relatedClassMechanics.map(mechanic => this.getClassMechanicClone(mechanic)),
            relatedMechanics: upgrade.relatedMechanics.map(mechanic => this.getMechanicClone(mechanic)),
            relatedBuffs: upgrade.relatedBuffs.map(buff => this.getBuffClone(buff)),
        
            template: upgrade.template,
            values: upgrade.values.map(value => this.slormancerEffectValueService.getEffectValueClone(value))
        };
    }

    public getUpgrade(upgradeId: number, heroClass: HeroClass, baseRank: number): SkillUpgrade | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, upgradeId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, upgradeId);
        let upgrade: SkillUpgrade | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Passive || gameDataSkill.TYPE === SkillType.Upgrade)) {
            const parentSkill = this.slormancerDataService.getGameDataSkill(heroClass, gameDataSkill.ACTIVE_BOX);
            const values = this.parseEffectValues(gameDataSkill, EffectValueUpgradeType.UpgradeRank);
            const masteryRequired = dataSkill === null ? 0 : valueOrDefault(dataSkill.masteryRequired, 0);
            const line = ((parentSkill !== null && parentSkill.TYPE === SkillType.Support) ? masteryRequired : Math.ceil(masteryRequired / 2))

            upgrade = {
                id: gameDataSkill.REF,
                skillId: gameDataSkill.ACTIVE_BOX,
                masteryRequired,
                line,
                type: gameDataSkill.TYPE,
                rank: 0,
                upgradeLevel: gameDataSkill.UNLOCK_LEVEL,
                maxRank: gameDataSkill.UPGRADE_NUMBER,
                baseRank: Math.min(gameDataSkill.UPGRADE_NUMBER, baseRank),
                name: gameDataSkill.EN_NAME,
                icon: 'assets/img/icon/skill/' + heroClass + '/' + gameDataSkill.REF + '.png',
                description: '',
                initialCost: gameDataSkill.COST,
                perLevelCost: gameDataSkill.COST_LEVEL,
                baseCost: 0,
                cost: 0,
                costType: <SkillCostType>gameDataSkill.COST_TYPE,
                hasLifeCost: false,
                hasManaCost: false,
                hasNoCost: false,
                genres: <Array<SkillGenre>>splitData(gameDataSkill.GENRE, ','),
                damageTypes: splitData(gameDataSkill.DMG_TYPE, ','),

                masteryLabel: null,
                rankLabel: null,
                genresLabel: null,
                costLabel: null,

                nextRankDescription: [],
                maxRankDescription: [],
                // prévoir de déplacer ça dans upgrade quand je ferais refonte templates
                relatedClassMechanics: this.extractSkillMechanics(gameDataSkill.EN_DESCRIPTION, heroClass, dataSkill === null ? [] : dataSkill.additionalClassMechanics),
                relatedMechanics: [],
                relatedBuffs: this.extractBuffs(gameDataSkill.EN_DESCRIPTION),
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                nextRankTemplate: values
                    .filter(value => isEffectValueSynergy(value) || isEffectValueVariable(value))
                    .filter(value => (<EffectValueSynergy | EffectValueVariable>value).upgrade !== 0)
                    .map(value => this.slormancerTemplateService.prepareNextRankDescriptionTemplate('@ £', value)),
                values
            };
    
            this.applyOverride(upgrade, dataSkill);

            upgrade.relatedMechanics = this.extractMechanics(gameDataSkill.EN_DESCRIPTION, values, dataSkill !== null && dataSkill.additionalMechanics ? dataSkill.additionalMechanics : []);
    
            this.updateUpgrade(upgrade);
        }

        return upgrade;
    }

    private getNextRankUpgradeDescription(upgrade: SkillUpgrade, rank: number): Array<string> {
        const skill = [];

        const cost = upgrade.initialCost + upgrade.perLevelCost * rank;
        if (cost > 0 && upgrade.perLevelCost !== 0) {
            const costClass = upgrade.hasLifeCost ? 'life' : 'mana';
            const description = '<span class="' + costClass + '">' + cost + '</span> ' + this.slormancerTranslateService.translate(upgrade.costType);
            skill.push(description);
        }

        const attributes = upgrade.values
            .filter(value => isEffectValueSynergy(value) || isEffectValueVariable(value))
            .filter(value => (<EffectValueSynergy | EffectValueVariable>value).upgrade !== 0)
            .map(value => this.slormancerEffectValueService.updateEffectValue({ ...value }, rank))
            .map((value, index) => this.slormancerTemplateService.formatNextRankDescription(<string>upgrade.nextRankTemplate[index], value));

        return [ ...skill, ...attributes ]
    }

    private extractBuffs(template: string): Array<Buff> {
        return valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillBuff(m))
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(ref => this.slormancerBuffService.getBuff(ref))
            .filter(isNotNullOrUndefined);
    }
    
    private extractSkillMechanics(template: string, heroClass: HeroClass, additionalSkillMechanics: Array<number>): Array<SkillClassMechanic> {
        const ids = valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataSkillClassMechanicIdByName(heroClass, m));
        return [ ...ids, ...additionalSkillMechanics ]
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(id => this.getClassMechanic(id, heroClass))
            .filter(isNotNullOrUndefined);
    }

    private extractMechanics(template: string, values: Array<AbstractEffectValue>, additional: Array<MechanicType>): Array<Mechanic> {
        const templateMechanics = valueOrDefault(template.match(/<(.*?)>/g), [])
            .map(m => this.slormancerDataService.getDataTemplateMechanic(m))
        const attributeMechanics = values.map(value => value.stat)
            .filter(isNotNullOrUndefined)
            .map(stat => this.slormancerDataService.getDataAttributeMechanic(stat))
        const synergyMechanics = values
            .filter(isEffectValueSynergy)
            .map(value => this.slormancerDataService.getDataAttributeMechanic(value.source))

        return [ ...attributeMechanics, ...synergyMechanics, ...templateMechanics, ...additional ]
            .filter(isNotNullOrUndefined)
            .filter(isFirst)
            .map(mechanic => this.slormancerMechanicService.getMechanic(mechanic));
    }

    public updateUpgrade(upgrade: SkillUpgrade) {
        upgrade.rank = Math.min(upgrade.maxRank, upgrade.baseRank);
        upgrade.baseCost = upgrade.initialCost + upgrade.perLevelCost * Math.max(upgrade.rank, 1);
        upgrade.cost = upgrade.baseCost;

        upgrade.hasLifeCost = upgrade.costType === SkillCostType.LifeSecond || upgrade.costType === SkillCostType.LifeLock || upgrade.costType === SkillCostType.Life;
        upgrade.hasManaCost = upgrade.costType === SkillCostType.ManaSecond || upgrade.costType === SkillCostType.ManaLock || upgrade.costType === SkillCostType.Mana;
        upgrade.hasNoCost = upgrade.costType === SkillCostType.None || upgrade.baseCost === 0;

        upgrade.nextRankDescription = [];
        upgrade.maxRankDescription = [];

        for (const effectValue of upgrade.values) {
            this.slormancerEffectValueService.updateEffectValue(effectValue, upgrade.rank);
        }

        if (upgrade.maxRank > 1 && upgrade.maxRank > upgrade.rank) {
            upgrade.nextRankDescription = this.getNextRankUpgradeDescription(upgrade, Math.min(upgrade.maxRank, upgrade.rank + 1));
            upgrade.maxRankDescription = this.getNextRankUpgradeDescription(upgrade, upgrade.maxRank);
        }
        
        upgrade.masteryLabel =  this.MASTERY_LABEL + ' ' + upgrade.masteryRequired;
        upgrade.rankLabel =  this.RANK_LABEL + ': ' + this.slormancerTemplateService.asSpan(upgrade.rank.toString(), 'current') + '/' + upgrade.maxRank;
        
        upgrade.genresLabel =  null;
        if (upgrade.genres.length > 0) {
            upgrade.genresLabel = upgrade.genres
                .map(genre => this.slormancerTranslateService.translate('atk_' + genre))
                .join(' ');
        }
        
        upgrade.costLabel = null;
        if (!upgrade.hasNoCost) {
            upgrade.costLabel = this.COST_LABEL
                + ': ' + this.slormancerTemplateService.asSpan(upgrade.cost.toString(), upgrade.hasManaCost ? 'value mana' : 'value life')
                + ' ' + this.slormancerTranslateService.translate(upgrade.costType);
        }
        
        upgrade.description = this.slormancerTemplateService.formatUpgradeDescription(upgrade.template, upgrade.values);
    }

    public getClassMechanic(mechanicId: number, heroClass: HeroClass): SkillClassMechanic | null {
        const gameDataSkill = this.slormancerDataService.getGameDataSkill(heroClass, mechanicId);
        const dataSkill = this.slormancerDataService.getDataSkill(heroClass, mechanicId);
        let mechanic: SkillClassMechanic | null = null;

        if (gameDataSkill !== null && (gameDataSkill.TYPE == SkillType.Mechanic || gameDataSkill.TYPE === SkillType.Mechanics)) {
            mechanic = {
                id: gameDataSkill.REF,
                type: gameDataSkill.TYPE,
                name: gameDataSkill.EN_NAME,
                icon: 'skill/' + heroClass + '/' + gameDataSkill.REF,
                description: '',
            
                template: this.slormancerTemplateService.getSkillDescriptionTemplate(gameDataSkill),
                values: this.parseEffectValues(gameDataSkill, EffectValueUpgradeType.UpgradeRank)
            };

            this.applyOverride(mechanic, dataSkill);
    
            this.updateClassMechanic(mechanic);
        }

        return mechanic;
    }

    public updateClassMechanic(upgrade: SkillClassMechanic) {
        upgrade.description = this.slormancerTemplateService.formatSkillDescription(upgrade.template, upgrade.values);
    }
}