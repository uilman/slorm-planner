import { Injectable } from '@angular/core';

import {
    CharacterStatMapping,
    HERO_CHARACTER_STATS_MAPPING,
} from '../../constants/content/data/data-character-stats-mapping';
import { Character } from '../../model/character';
import { CharacterConfig } from '../../model/character-config';
import { SynergyResolveData } from '../../model/content/character-stats';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { ALL_ATTRIBUTES } from '../../model/content/enum/attribute';
import { ALL_GEAR_SLOT_VALUES } from '../../model/content/enum/gear-slot';
import { SkillType } from '../../model/content/skill-type';
import { isEffectValueSynergy, isNotNullOrUndefined } from '../../util/utils';

export declare type CharacterExtractedStatMap = { [key: string]: Array<number> }

export interface CharacterExtractedStats {
    heroStats: CharacterExtractedStatMap;
    synergies: Array<SynergyResolveData>;
    isolatedSynergies: Array<SynergyResolveData>;
    supportStats: CharacterExtractedStatMap;
    primaryStats: CharacterExtractedStatMap;
    secondaryStats: CharacterExtractedStatMap;
}

@Injectable()
export class SlormancerStatsExtractorService {

    private getSynergyStatsItWillUpdate(stat: string): Array<{ stat: string, mapping?: CharacterStatMapping }> {
        let result: Array<{ stat: string, mapping?: CharacterStatMapping }> = [];

        for (const mapping of HERO_CHARACTER_STATS_MAPPING) {
            if (mapping.source.flat.indexOf(stat) !== -1 || mapping.source.percent.indexOf(stat) !== -1 || mapping.source.multiplier.indexOf(stat) !== -1) {
                result.push({ stat: mapping.stat, mapping });
            }
        }

        if (result.length === 0) {
            result.push({ stat });
        }

        return result;
    }

    private addAncestralLegacyValues(character: Character, stats: CharacterExtractedStats) {
        for (const ancestralLegacy of character.ancestralLegacies.ancestralLegacies) {
            const equipped = character.ancestralLegacies.activeAncestralLegacies.indexOf(ancestralLegacy.id) !== -1;

            for (const effectValue of ancestralLegacy.values) {
                if (isEffectValueSynergy(effectValue)) {
                    if (equipped && effectValue.stat !== 'damage') {
                        stats.synergies.push({
                            effect: effectValue,
                            valueChanged: false,
                            objectSource: { ancestralLegacy },
                            statsItWillUpdate: this.getSynergyStatsItWillUpdate(effectValue.stat)
                        });
                    } else {
                        stats.isolatedSynergies.push({
                            effect: effectValue,
                            valueChanged: false,
                            objectSource: { ancestralLegacy },
                            statsItWillUpdate: []
                        });
                    }
                } else if (equipped) {
                    this.addStat(stats.heroStats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addAttributesValues(character: Character, stats: CharacterExtractedStats) {
        for (const attribute of ALL_ATTRIBUTES) {
            const attributeTraits = character.attributes.allocated[attribute]
            for (const effectValue of attributeTraits.values) {
                if (isEffectValueSynergy(effectValue)) {
                    stats.synergies.push({
                        effect: effectValue,
                        valueChanged: false,
                        objectSource: { attribute: attributeTraits },
                        statsItWillUpdate: this.getSynergyStatsItWillUpdate(effectValue.stat)
                    });
                } else {
                    this.addStat(stats.heroStats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addReaperValues(character: Character, stats: CharacterExtractedStats) {
        if (character.reaper !== null) {
            this.addStat(stats.heroStats, 'min_weapon_damage_add', character.reaper.damages.min);
            this.addStat(stats.heroStats, 'max_weapon_damage_add', character.reaper.damages.max - character.reaper.damages.min);

            const effectValues: Array<AbstractEffectValue> = character.reaper.templates.base.map(effect => effect.values).flat();
            if (character.reaper.primordial) {
                effectValues.push(...character.reaper.templates.benediction.map(effect => effect.values).flat());
                effectValues.push(...character.reaper.templates.malediction.map(effect => effect.values).flat());
            }

            for (const effectValue of effectValues) {
                if (isEffectValueSynergy(effectValue)) {
                    stats.synergies.push({
                        effect: effectValue,
                        valueChanged: false,
                        objectSource: { reaper: character.reaper },
                        statsItWillUpdate: this.getSynergyStatsItWillUpdate(effectValue.stat)
                    });
                } else {
                    if (effectValue.stat === null) console.log(character.reaper.id + ' - ' + character.reaper.name + ' : reaper value : ', effectValue, character.reaper.templates);
                    this.addStat(stats.heroStats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addInventoryValues(character: Character, stats: CharacterExtractedStats) {
        // TODO optimisation possible : un exemplaire de chaque effect legendaire géré par le service
        const items = [...character.inventory, ...character.sharedInventory.flat()]
            .filter(isNotNullOrUndefined)

        for (const item of items) {
            if (item.legendaryEffect !== null) {
                for (const craftedEffect of item.legendaryEffect.effects) {
                    if (isEffectValueSynergy(craftedEffect.effect)) {
                        stats.isolatedSynergies.push({
                            effect: craftedEffect.effect,
                            valueChanged: false,
                            objectSource: { item },
                            statsItWillUpdate: []
                        });
                    }
                }
            }
        }
    }

    private addGearValues(character: Character, stats: CharacterExtractedStats) {
        const items = ALL_GEAR_SLOT_VALUES
            .map(slot => character.gear[slot])
            .filter(isNotNullOrUndefined);

        for (const item of items) {
            const effectValues = [...item.affixes.map(affix => affix.craftedEffect), ...(item.legendaryEffect === null ? [] : item.legendaryEffect.effects)]
                .flat()
                .map(craftedEffect => craftedEffect.effect);
                
            for (const effectValue of effectValues) {
                if (isEffectValueSynergy(effectValue)) {
                    stats.synergies.push({
                        effect: effectValue,
                        valueChanged: false,
                        objectSource: { item },
                        statsItWillUpdate: this.getSynergyStatsItWillUpdate(effectValue.stat)
                    });
                } else {
                    if (effectValue.stat === null) console.log(item.name + ' : gear value : ', effectValue, item.legendaryEffect);
                    this.addStat(stats.heroStats, effectValue.stat, effectValue.value);
                }
            }
        }
    }

    private addSkillValues(character: Character, stats: CharacterExtractedStats) {
        for (const sau of character.skills) {
            const isPrimary = sau.skill === character.primarySkill;
            const isSecondary = sau.skill === character.secondarySkill;
            const isSupport = sau.skill === character.supportSkill;
            
            for (const skillValue of sau.skill.values) {
                if (isEffectValueSynergy(skillValue)) {
                    stats.isolatedSynergies.push({
                        effect: skillValue,
                        valueChanged: false,
                        objectSource: { skill: sau.skill },
                        statsItWillUpdate: []
                    });
                } else if (isPrimary) {
                    this.addStat(stats.primaryStats, skillValue.stat, skillValue.value);
                } else if (isSecondary) {
                    this.addStat(stats.secondaryStats, skillValue.stat, skillValue.value);
                } else if (isSupport) {
                    this.addStat(stats.supportStats, skillValue.stat, skillValue.value);
                }
            }

            for (const upgrade of sau.upgrades) {
                const equipped = (isPrimary || isSecondary || isSupport) && sau.selectedUpgrades.indexOf(upgrade.id) !== -1;
                
                for (const upgradeValue of upgrade.values) {
                    if (isEffectValueSynergy(upgradeValue)) {
                        if (equipped && upgradeValue.stat !== 'damage') {
                            stats.synergies.push({
                                effect: upgradeValue,
                                valueChanged: false,
                                objectSource: { upgrade },
                                statsItWillUpdate: this.getSynergyStatsItWillUpdate(upgradeValue.stat)
                            });
                        } else {
                            stats.isolatedSynergies.push({
                                effect: upgradeValue,
                                valueChanged: false,
                                objectSource: { upgrade },
                                statsItWillUpdate: []
                            });
                        }
                    } else if (equipped) {
                        if (upgrade.type === SkillType.Passive) {
                            this.addStat(stats.heroStats, upgradeValue.stat, upgradeValue.value);
                        } else if (isPrimary) {
                            this.addStat(stats.primaryStats, upgradeValue.stat, upgradeValue.value);
                        } else if (isSecondary) {
                            this.addStat(stats.secondaryStats, upgradeValue.stat, upgradeValue.value);
                        } else if (isSupport) {
                            this.addStat(stats.supportStats, upgradeValue.stat, upgradeValue.value);
                        }
                    }
                }
            }
        }
    }

    private addStat(cache: { [key: string]: Array<number> }, stat: string, value: number) {
        if (stat === null) {
            console.log('NULL stat found at ', new Error().stack);
        } else {
            let foundStat = cache[stat];
            
            if (foundStat === undefined) {
                foundStat = [];
                cache[stat] = foundStat;
            }
    
            foundStat.push(value);
        }
    }

    public extractStats(character: Character, config: CharacterConfig): CharacterExtractedStats {
        const result: CharacterExtractedStats = {
            synergies:  [],
            isolatedSynergies:  [],
            heroStats: { },
            supportStats: { },
            primaryStats: { },
            secondaryStats: { },
        }

        const baseStats = character.baseStats.map(stat => stat.values.map(value => <[string, number]>[stat.stat, value])).flat();
        for (const baseStat of baseStats) {
            this.addStat(result.heroStats, baseStat[0], baseStat[1]);
        }
        
        this.addAncestralLegacyValues(character, result);
        this.addAttributesValues(character, result);
        this.addReaperValues(character, result);
        this.addGearValues(character, result);
        this.addInventoryValues(character, result);
        this.addSkillValues(character, result);
        
        return result;
    }
}