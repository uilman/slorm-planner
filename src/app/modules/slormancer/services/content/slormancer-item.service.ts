import { Injectable } from '@angular/core';

import { Affix } from '../../model/content/affix';
import { AttributeEnchantment } from '../../model/content/attribute-enchantment';
import { Attribute } from '../../model/content/enum/attribute';
import { EffectValueType } from '../../model/content/enum/effect-value-type';
import { EffectValueUpgradeType } from '../../model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '../../model/content/enum/effect-value-value-type';
import { EquipableItemBase } from '../../model/content/enum/equipable-item-base';
import { HeroClass } from '../../model/content/enum/hero-class';
import { Rarity } from '../../model/content/enum/rarity';
import { ReaperSmith } from '../../model/content/enum/reaper-smith';
import { EquipableItem as EquippableItem } from '../../model/content/equipable-item';
import { ReaperEnchantment } from '../../model/content/reaper-enchantment';
import { SkillEnchantment } from '../../model/content/skill-enchantment';
import { GameEnchantment, GameEquippableItem, GameItem, GameRessourceItem } from '../../model/parser/game/game-item';
import {
    compare,
    compareRarities,
    compareString,
    firstValue,
    isNotNullOrUndefined,
    lastValue,
    valueOrDefault,
} from '../../util/utils';
import { SlormancerCraftedValueService } from './slormancer-affix.service';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerItemValueService } from './slormancer-item-value.service';
import { SlormancerLegendaryEffectService } from './slormancer-legendary-effect.service';
import { SlormancerTemplateService } from './slormancer-template.service';
import { SlormancerTranslateService } from './slormancer-translate.service';

@Injectable()
export class SlormancerItemService {

    private readonly REAPER_ENCHANTMENT_LABEL = this.slormancerTranslateService.translate('tt_RP_roll_item');
    private readonly SKILL_ENCHANTMENT_LABEL = this.slormancerTranslateService.translate('tt_MA_roll_item');
    private readonly RARE_PREFIX = this.slormancerTranslateService.translate('RAR_loot_epic');

    private readonly AFFIX_ORDER = ['life', 'mana', 'ret', 'cdr', 'crit', 'minion', 'atk_phy', 'atk_mag', 'def_dodge', 'def_mag', 'def_phy', 'adventure'];

    private readonly AFFIX_DEF_POSSIBLE = ['crit', 'ret', 'mana', 'cdr', 'life'];

    constructor(private slormancerTemplateService: SlormancerTemplateService,
                private slormancerTranslateService : SlormancerTranslateService,
                private slormancerItemValueService : SlormancerItemValueService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private slormancerItemAffixService: SlormancerCraftedValueService,
                private slormancerDataService: SlormancerDataService) { }

    public getEquipableItemBase(item: GameEquippableItem): EquipableItemBase {
        let slot: EquipableItemBase = EquipableItemBase.Helm;

        if (item !== null) {
            switch (item.slot) {
                case 0: slot = EquipableItemBase.Helm; break;
                case 1: slot = EquipableItemBase.Body; break;
                case 2: slot = EquipableItemBase.Shoulder; break;
                case 3: slot = EquipableItemBase.Bracer; break;
                case 4: slot = EquipableItemBase.Glove; break;
                case 5: slot = EquipableItemBase.Boot; break;
                case 6: slot = EquipableItemBase.Ring; break;
                case 7: slot = EquipableItemBase.Amulet; break;
                case 8: slot = EquipableItemBase.Belt; break;
                case 9: slot = EquipableItemBase.Cape; break;
                default: 
                    console.error('Unexpected item slot ' + item.slot);
                    break;
            }
        }
        return slot;
    }

    public isEquipableItem(item: GameItem | null): item is GameEquippableItem {
        return item !== null && item.hasOwnProperty('slot');
    }

    public isRessourceItem(item: GameItem | null): item is GameRessourceItem {
        return item !== null && item.hasOwnProperty('quantity');
    }

    private getItemName(item: EquippableItem): string {
        const resultFragments: Array<string> = [];

        if (item.legendaryEffect !== null) {
            resultFragments.push(item.legendaryEffect.name);
        } else {
            let genre = 'MS';

            const normalAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Normal);
            if (normalAffixes.length > 0) {
                const baseAffixes = <[string, string]>(<[Affix, Affix]>[
                    normalAffixes[0],
                    valueOrDefault(normalAffixes[1], normalAffixes[0])
                ])
                    .map(data => data.primaryNameType)
                    .sort((a, b) => compare(this.AFFIX_ORDER.indexOf(a), this.AFFIX_ORDER.indexOf(b)));
              
                const onDef = baseAffixes[1].startsWith('def') && this.AFFIX_DEF_POSSIBLE.indexOf(baseAffixes[0]) !== -1;

                const baseName = this.slormancerTranslateService.translate('PIECE_loot_' + item.base.toUpperCase() + '_' + baseAffixes[1]);
                const textAndGenre = this.slormancerTranslateService.splitTextAndGenre(baseName);
                resultFragments.push(textAndGenre.text);
                genre = textAndGenre.genre;
                
                const baseAdj = this.slormancerTranslateService.translate('NAME_loot_adj_' + baseAffixes[0] + (onDef ? '_ON_DEF' : ''), genre);
                resultFragments.unshift(baseAdj);
            }
    
            const magicAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Magic);
            if (magicAffixes[0]) {
                resultFragments.push(this.slormancerTranslateService.translate('SUF_loot_suf_' + magicAffixes[0].craftedEffect.effect.stat));
            }
    
            const rareAffixes = item.affixes.filter(affix => affix.rarity === Rarity.Rare);
            if (rareAffixes[0]) {
                resultFragments.unshift(this.slormancerTranslateService.translate('PRE_loot_pre_' + rareAffixes[0].craftedEffect.effect.stat));
            }

            if (item.rarity === Rarity.Epic) {
                resultFragments.unshift(this.RARE_PREFIX);
            }
    
        }

        if (item.reinforcment > 0) {
            resultFragments.push('+' + item.reinforcment);
        }

        return resultFragments.join(' ');
    }

    private getItemRarity(item: EquippableItem): Rarity {
        const rarities = item.affixes.map(affix => affix.rarity);
        let rarity = Rarity.Normal;

        if (item.legendaryEffect !== null) {
            rarity = Rarity.Legendary;
        } else if (rarities.indexOf(Rarity.Epic) !== -1) {
            rarity = Rarity.Epic;
        } else if (rarities.indexOf(Rarity.Rare) !== -1) {
            rarity = Rarity.Rare;
        } else if (rarities.indexOf(Rarity.Magic) !== -1) {
            rarity = Rarity.Magic;
        }

        return rarity;
    }

    private getItemIcon(item: EquippableItem): string {
        let base: string | null = null;

        if (item.legendaryEffect !== null) {
            base = item.legendaryEffect.itemIcon;
        } else {
            const affixes = item.affixes
                .filter(affix => affix.rarity === Rarity.Normal)
                .map(affix => affix.primaryNameType)
                .sort()
                .join('-');
            base = 'assets/img/icon/item/' + item.base + '/' + affixes + '.png';
        }

        return base;
    }

    private getReaperEnchantment(gameEnchantment: GameEnchantment): ReaperEnchantment | null {
        return {
            craftedReaperSmith: gameEnchantment.type as ReaperSmith,
            craftableValues: this.slormancerItemValueService.computeReaperEnchantmentValues(),
            craftedValue: gameEnchantment.value,
            
            effect: {
                type:EffectValueType.Variable,
                percent: false,
                value: 0,
                displayValue: 0,
                baseValue: 0,
                stat: '',
                valueType: EffectValueValueType.Stat,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                upgrade: 0,
            },

            label: '',
            icon: 'enchantment/reaper'
        }
    }

    private getSkillEnchantment(gameEnchantment: GameEnchantment): SkillEnchantment | null {
        return {
            craftedSkill: gameEnchantment.type,
            craftableValues: this.slormancerItemValueService.computeSkillEnchantmentValues(),
            craftedValue: gameEnchantment.value,
            
            effect: {
                type:EffectValueType.Variable,
                percent: false,
                value: 0,
                displayValue: 0,
                baseValue: 0,
                stat: '',
                valueType: EffectValueValueType.Stat,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                upgrade: 0,
            },

            label: '',
            icon: ''
        };
    }

    private getAttributeEnchantment(gameEnchantment: GameEnchantment): AttributeEnchantment | null {
        return {
            craftedAttribute: gameEnchantment.type as Attribute,
            craftableValues: this.slormancerItemValueService.computeAttributeEnchantmentValues(),
            craftedValue: gameEnchantment.value,
            
            effect: {
                type:EffectValueType.Variable,
                percent: false,
                value: 0,
                displayValue: 0,
                baseValue: 0,
                stat: '',
                valueType: EffectValueValueType.Stat,
                upgradeType: EffectValueUpgradeType.Reinforcment,
                upgrade: 0,
            },

            label: '',
            icon: ''
        };
    }

    public getEquipableItem(item: GameEquippableItem, heroClass: HeroClass): EquippableItem {
        const base = this.getEquipableItemBase(item);
        const affixes = item.affixes
            .filter(affix => affix.rarity !== 'L')
            .map(affix => this.slormancerItemAffixService.getAffix(affix, item.level, item.reinforcment))
            .filter(isNotNullOrUndefined)
            .sort((a, b) => {
                const rarity = compareRarities(a.rarity, b.rarity);
                return rarity === 0 ? compareString(a.statLabel, b.statLabel) : rarity;
            });
        const legendaryAffix = item.affixes.find(affix => affix.rarity === 'L');        
        const reaperEnchantment = item.enchantments.find(c => c.target === 'RP');
        const skillEnchantment = item.enchantments.find(c => c.target === 'MA');
        const attributeEnchantment = item.enchantments.find(c => c.target === 'AT');

        const result = {
            base,
            affixes,
            legendaryEffect: legendaryAffix === undefined ? null : this.slormancerLegendaryEffectService.getLegendaryEffect(legendaryAffix, item.reinforcment, heroClass),
            level: item.level,
            reinforcment: item.reinforcment,
            reaperEnchantment: reaperEnchantment ? this.getReaperEnchantment(reaperEnchantment) : null,
            skillEnchantment: skillEnchantment ? this.getSkillEnchantment(skillEnchantment) : null,
            attributeEnchantment: attributeEnchantment ? this.getAttributeEnchantment(attributeEnchantment) : null,
            heroClass,

            rarity: Rarity.Normal,
            name: '',
            baseLabel: '',
            rarityLabel: '',
            levelLabel: '',
            icon: '',
            itemIconBackground: ''
        };

        this.updateEquippableItem(result);

        return result;
    }

    public updateEquippableItem(item: EquippableItem) {
        item.rarity = this.getItemRarity(item);
        item.name = this.getItemName(item);
        item.baseLabel =  this.slormancerTranslateService.removeGenre(this.slormancerTranslateService.translate('PIECE_' + item.base));
        item.rarityLabel = this.slormancerTranslateService.translate('RAR_loot_' + item.rarity);
        item.icon = this.getItemIcon(item);
        item.levelLabel = this.slormancerTranslateService.translate('lvl') + '. ' + item.level;
        item.itemIconBackground = 'assets/img/background/bg-' + item.rarity + '.png';

        for (const affix of item.affixes) {
            affix.itemLevel = item.level;
            affix.reinforcment = item.reinforcment;

            this.slormancerItemAffixService.updateAffix(affix);
        }

        if (item.legendaryEffect !== null) {
            item.legendaryEffect.reinforcment = item.reinforcment;
            this.slormancerLegendaryEffectService.updateLegendaryEffect(item.legendaryEffect);
        }

        if (item.reaperEnchantment !== null) {
            const value = valueOrDefault(item.reaperEnchantment.craftableValues[item.reaperEnchantment.craftedValue], 0);

            item.reaperEnchantment.effect.value = value
            item.reaperEnchantment.effect.stat = 'increased_reapersmith_' + item.reaperEnchantment.craftedReaperSmith + '_level';

            const smith = this.slormancerTranslateService.translate('weapon_reapersmith_' + item.reaperEnchantment.craftedReaperSmith);
            const min = valueOrDefault(firstValue(item.reaperEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.reaperEnchantment.craftableValues), 0);
            item.reaperEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.REAPER_ENCHANTMENT_LABEL, value, min, max, smith);
        }

        if (item.skillEnchantment !== null) {
            const value = valueOrDefault(item.skillEnchantment.craftableValues[item.skillEnchantment.craftedValue], 0);

            item.skillEnchantment.effect.value = value;
            item.skillEnchantment.effect.stat = 'increased_skill_' + item.skillEnchantment.craftedSkill + '_level';

            const skill = this.slormancerDataService.getGameDataSkill(item.heroClass, item.skillEnchantment.craftedSkill);
            const min = valueOrDefault(firstValue(item.skillEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.skillEnchantment.craftableValues), 0);
            item.skillEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.SKILL_ENCHANTMENT_LABEL, value, min, max, skill === null ? '??' : skill.EN_NAME);
            item.skillEnchantment.icon = 'enchantment/skill/' + item.heroClass + '/' + item.skillEnchantment.craftedSkill;
        }

        if (item.attributeEnchantment !== null) {
            const value = valueOrDefault(item.attributeEnchantment.craftableValues[item.attributeEnchantment.craftedValue], 0);

            item.attributeEnchantment.effect.value = value;
            item.attributeEnchantment.effect.stat = 'increased_attribute_' + item.attributeEnchantment.craftedAttribute + '_level';

            const attributeName = this.slormancerTranslateService.translate('character_trait_' + item.attributeEnchantment.craftedAttribute);
            const min = valueOrDefault(firstValue(item.attributeEnchantment.craftableValues), 0);
            const max = valueOrDefault(lastValue(item.attributeEnchantment.craftableValues), 0);
            item.attributeEnchantment.label = this.slormancerTemplateService.getReaperEnchantmentLabel(this.SKILL_ENCHANTMENT_LABEL, value, min, max, attributeName);
            item.attributeEnchantment.icon = 'enchantment/attribute/' + item.attributeEnchantment.craftedAttribute;
        }
    }
}