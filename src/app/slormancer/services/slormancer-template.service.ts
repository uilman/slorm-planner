import { Injectable } from '@angular/core';

import { AttributeEnchantment } from '../model/attribute-enchantment';
import { ComputedEffectValue } from '../model/computed-effect-value';
import { EffectValueConstant, EffectValueSynergy, EffectValueVariable } from '../model/effect-value';
import { HeroClass } from '../model/enum/hero-class';
import { GameDataActivable } from '../model/game/data/game-data-activable';
import { GameDataLegendary } from '../model/game/data/game-data-legendary';
import { GameDataReaper } from '../model/game/data/game-data-reaper';
import { LegendaryEffect } from '../model/legendary-effect';
import { ReaperEnchantment } from '../model/reaper-enchantment';
import { Skill } from '../model/skill';
import { SkillEnchantment } from '../model/skill-enchantment';
import {
    findFirst,
    firstValue,
    isEffectValueConstant,
    isEffectValueSynergy,
    isEffectValueVariable,
    isNotNullOrUndefined,
    lastValue,
    splitData,
    valueOrNull,
} from '../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';

@Injectable()
export class SlormancerTemplateService {

    private readonly REAPER_ENCHANTMENT_TEMPLATE = '+@ Level on $\'s £';
    private readonly SKILL_ENCHANTMENT_TEMPLATE = '+@ $ Mastery';
    private readonly ATTRIBUTE_ENCHANTMENT_TEMPLATE = '+@ $';

    public readonly STAT_ANCHOR = '£';
    public readonly TYPE_ANCHOR = '$';
    public readonly VALUE_ANCHOR = '@';
    public readonly CONSTANT_ANCHORS = ['¤', '~'];
    public readonly SYNERGY_ANCHOR = '_';
    public readonly MINMAX_ANCHOR = '_';
    public readonly SYNERGY_PREFIX = 'synergy:';
    public readonly DAMAGE_PREFIX = 'damage:';
    public readonly RETURN_REGEXP = /#/g;

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerItemValueService: SlormancerItemValueService) { }

    private asSpan(content: string, className: string): string {
        return '<span class="' + className + '">' + content + '</span>';
    }

    public replaceAnchor(template: string, value: string, anchor: string): string {
        return template.replace(anchor, value)
    }

    private computedValueToFormula(computed: ComputedEffectValue): string {
        let formula: string | null = null;
        const percent = computed.percent ? '%' : '';

        if (computed.range !== null || computed.upgrade > 0) {
            formula = '';
            if (computed.range !== null) {
                formula += firstValue(computed.range) + percent + ' - ' + lastValue(computed.range) + percent;
            }
            
            if (computed.upgrade > 0) {
                if (computed.baseRange === null) {
                    formula += computed.baseValue + percent;
                }

                formula += ' + ' + computed.upgrade + percent + ' per upgrade';
            }
        }

        return formula === null ? '' : this.asSpan(' (' + formula + ')', 'formula');
    }

    private applyEffectValueVariable(template: string, baseValue: number, effectValue: EffectValueVariable, reinforcment: number, anchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectVariableDetails(effectValue, baseValue, reinforcment);
        const percent = computed.percent ? '%' : '';

        const value = this.asSpan(computed.value + percent, 'value')
        const formula = this.computedValueToFormula(computed);

        return this.replaceAnchor(template, value + formula, anchor);
    }

    private applyEffectValueConstant(template: string, value: EffectValueConstant, anchor: string): string {
        return this.replaceAnchor(template, this.asSpan(value.value.toString(), 'value'), anchor);
    }

    private applyEffectValueSynergy(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, synergyAnchor: string, valueAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        
        const value = this.asSpan(computed.value + '%', 'value');
        const formula = this.computedValueToFormula(computed);

        template = this.replaceAnchor(template, value + formula, valueAnchor);

        if (computed.synergy !== null) {
            let synergy: string | null = null;
            if (typeof computed.synergy === 'number') {
                synergy = this.asSpan(computed.synergy.toString(), 'value');
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
            }

            template = this.replaceAnchor(template, synergy, synergyAnchor);
        }

        return template;
    }

    private applyEffectValueSynergyForActivable(template: string, baseValue: number, effectValue: EffectValueSynergy, reinforcment: number, valueAnchor: string,  synergyAnchor: string): string {
        const computed = this.slormancerItemValueService.computeEffectSynergyDetails(effectValue, baseValue, reinforcment);
        const formula = this.computedValueToFormula(computed);

        if (computed.synergy !== null) {
            let synergy: string | null = null;

            if (typeof computed.synergy === 'number') {
                synergy = this.asSpan(computed.synergy.toString(), 'value');
                template = this.replaceAnchor(template, synergy, valueAnchor);
                template = this.replaceAnchor(template, this.asSpan(computed.value + '%', 'value') + formula, synergyAnchor);
            } else {
                synergy = this.asSpan(computed.synergy.min + ' - ' + computed.synergy.max, 'value');
                template = this.replaceAnchor(template, synergy + formula, synergyAnchor);
            }

        }

        return template;
    }

    public formatLegendaryDescription(effect: LegendaryEffect, reinforcment: number) {
        let template = effect.description;

        for (let effectValue of effect.values) {
            if (isEffectValueVariable(effectValue)) {
                template = this.applyEffectValueVariable(template, effect.value, effectValue, reinforcment, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                template = this.applyEffectValueSynergy(template, effect.value, effectValue, reinforcment, this.SYNERGY_ANCHOR, this.VALUE_ANCHOR);
            }
        }

        return template;
    }

    public formatSkillDescription(skill: Skill, level: number): string {
        let template = skill.description;

        for (let effectValue of skill.values) {
            if (isEffectValueVariable(effectValue)) {
                template = this.applyEffectValueVariable(template, 0, effectValue, level, this.VALUE_ANCHOR);
            } else if (isEffectValueConstant(effectValue)) {
                const anchor = findFirst(template, this.CONSTANT_ANCHORS);
                if (anchor !== null) {
                    template = this.applyEffectValueConstant(template, effectValue, anchor);
                }
            } else if (isEffectValueSynergy(effectValue)) {
                template = this.applyEffectValueSynergyForActivable(template, 0, effectValue, level, this.VALUE_ANCHOR, this.SYNERGY_ANCHOR);
            }
            
        }

        return template;
    }

    public getLegendaryDescriptionTemplate(data: GameDataLegendary): string {
        const stats = splitData(data.STAT);
        const types = splitData(data.TYPE)

        return this.parseTemplate(data.EN_DESC, stats, types)
    }

    public getSkillDescriptionTemplate(data: GameDataActivable): string {
        const stats = splitData(data.DESC_VALUE)
        const types = splitData(data.DESC_VALUE_REAL)
        
        return this.parseTemplate(data.EN_DESCRIPTION, stats, types);
    }

    private getSynergyType(synergy: string): string | null {
        return valueOrNull(splitData(synergy, ':')[1]);
    }

    private parseTemplate(template: string, stats: Array<string> = [], types: Array<string> = []) {
        template = stats.map(stat => this.translate(stat))
            .reduce((desc, stat) => desc.replace(this.STAT_ANCHOR, stat), template);

        template = types
            .map(synergy => this.getSynergyType(synergy))
            .filter(isNotNullOrUndefined)
            .map(synergy => this.translate(synergy))
            .reduce((desc, synergy) => desc.replace(this.TYPE_ANCHOR, synergy), template);
        
        template = template.replace(/<|>/g, '');
        template = template.replace(/\(/g, '<span class="formula">(');
        template = template.replace(/\)/g, ')</span>');
        template = template.replace(this.RETURN_REGEXP, '</br>');

        return template;
    }

    public translate(key: string): string {
        const gameData = this.slormancerDataService.getTranslation(key);
        const data = this.slormancerDataService.getDataAffixByRef(key);
        const keyword = this.slormancerDataService.getKeywordName(key);
        let result = key;

        if (gameData !== null) {
            result = gameData.EN;
        } else if (data !== null) {
            console.warn('affix by ref used : ', key);
            result = data.name;
        } else if (keyword !== null) {
            console.warn('keyword used : ', key);
            result = keyword;
        }

        return result;
    }

    public getReaperEnchantmentLabel(enchantment: ReaperEnchantment): string {
        let template = this.REAPER_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, this.translate(enchantment.name), this.TYPE_ANCHOR);
        template = this.replaceAnchor(template, this.translate('tooltip_reapers'), this.STAT_ANCHOR);

        return template;
    }

    public getSkillEnchantmentLabel(enchantment: SkillEnchantment, heroClass: HeroClass): string {
        const gameData = this.slormancerDataService.getGameDataSkill(heroClass, enchantment.type);
        let template = this.SKILL_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, gameData !== null ? gameData.EN_NAME : '??', this.TYPE_ANCHOR);

        return template;
    }

    public getAttributeEnchantmentLabel(enchantment: AttributeEnchantment): string {
        let template = this.ATTRIBUTE_ENCHANTMENT_TEMPLATE;

        const value = this.asSpan(enchantment.value.toString(), 'value')
            +  this.asSpan(' (' + firstValue(enchantment.values) + ' - ' + lastValue(enchantment.values) + ')', 'range');
        template = this.replaceAnchor(template, value, this.VALUE_ANCHOR);
        template = this.replaceAnchor(template, this.translate(enchantment.name), this.TYPE_ANCHOR);

        return template;
    }
    
    public getReaperType(reaperClass: HeroClass): string {
        return this.translate('weapon_' + reaperClass);
    }

    public getReaperName(name: string, reaperClass: HeroClass, primordial: boolean): string {
        let type = this.getReaperType(reaperClass);
        
        if (primordial) {
            type = this.replaceAnchor(this.translate('tt_reaper_corrupted'), type , this.VALUE_ANCHOR)
        }

        return this.replaceAnchor(name, type, this.TYPE_ANCHOR);
    }

    public getReaperBuilderName(id: number): string {
        return this.translate('weapon_reapersmith_' + id);
    }

    private formatReaperTemplate(template: string): Array<string> {
        return template.split('|*')
            .map(t => t.split('*').filter(t => t.length > 0).join('<br/>'))
            .filter(t => t.length > 0);
    }

    public getReaperDescription(data: GameDataReaper): { base: Array<string>, benediction: Array<string>, malediction: Array<string> } {
        const [baseStat, benedictionStat, maledictionStat] = splitData(data.VALUE_STAT, '\n');
        const [baseReal, benedictionReal, maledictionReal] = splitData(data.VALUE_REAL, '\n');
        const [baseTemplate, benedictionTemplate, maledictionTemplate] = splitData(data.EN_DESC, '/\n');
        
        let base: Array<string> = [];
        let benediction: Array<string> = [];
        let malediction: Array<string> = [];
        
        if (baseTemplate) {
            const stats = splitData(baseStat);
            const reals = splitData(baseReal);
            base = this.formatReaperTemplate(this.parseTemplate(baseTemplate, stats, reals));
        }
        if (benedictionTemplate) {
            const stats = splitData(benedictionStat);
            const reals = splitData(benedictionReal);
            benediction = this.formatReaperTemplate(this.parseTemplate(benedictionTemplate, stats, reals));
        }
        if (maledictionTemplate) {
            const stats = splitData(maledictionStat);
            const reals = splitData(maledictionReal);
            malediction = this.formatReaperTemplate(this.parseTemplate(maledictionTemplate, stats, reals));
        }

        return { base, benediction, malediction };
    }
}