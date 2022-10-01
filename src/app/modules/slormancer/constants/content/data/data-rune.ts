import { DataRune } from '@slormancer/model/content/data/data-rune';
import { EffectValueType } from '@slormancer/model/content/enum/effect-value-type';
import { EffectValueUpgradeType } from '@slormancer/model/content/enum/effect-value-upgrade-type';
import { EffectValueValueType } from '@slormancer/model/content/enum/effect-value-value-type';
import { Rune } from '@slormancer/model/content/rune';
import { effectValueConstant, effectValueSynergy, effectValueVariable } from '@slormancer/util/effect-value.util';
import { isEffectValueSynergy, isEffectValueVariable } from '@slormancer/util/utils';


function setStat(rune: Rune, index: number, stat: string) {
    const value = rune.values[index]

    if (value) {
        value.stat = stat;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setValue(rune: Rune, index: number, newValue: number) {
    const value = rune.values[index]

    if (value) {
        value.baseValue = newValue;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setUpgrade(rune: Rune, index: number, upgrade: number) {
    const value = rune.values[index]

    if (value && (isEffectValueVariable(value) || isEffectValueSynergy(value))) {
        value.upgrade = upgrade;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setType(rune: Rune, index: number, type: EffectValueType) {
    const value = rune.values[index]

    if (value) {
        value.type = type;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function setPercent(rune: Rune, index: number, percent: boolean) {
    const value = rune.values[index]

    if (value) {
        value.percent = percent;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

/*

function setSource(rune: Rune, index: number, source: string) {
    const value = rune.values[index]

    if (value && isEffectValueSynergy(value)) {
        value.source = source;
    } else {
        throw new Error('failed to update stat for rune value at index ' + index);
    }
}

function valueMultiply100(effect: LegendaryEffect, index: number) {
    const value = effect.effects[index]

    if (value) {
        value.score = value.score * 100;
    } else {
        throw new Error('failed to multiply synergy percent at index ' + index);
    }
}

function synergySetAllowMinMax(effect: LegendaryEffect, index: number, allowMinMaw: boolean) {
    const value = effect.effects[index]

    if (value && isEffectValueSynergy(value.effect)) {
        value.effect.allowMinMax = allowMinMaw;
    } else {
        throw new Error('failed to update allow min max at index ' + index);
    }
}*/

function addConstant(rune: Rune, value: number, stat: string, valueType: EffectValueValueType) {
    rune.values.push(effectValueConstant(value, false, stat, valueType));
}

function addVariable(rune: Rune, value: number, upgrade: number, stat: string, valueType: EffectValueValueType, percent: boolean = true) {
    rune.values.push(effectValueVariable(value, upgrade, EffectValueUpgradeType.RuneLevel, percent, stat, valueType));
}

function addSynergy(rune: Rune, value: number, upgrade: number, source: string, stat: string) {
    rune.values.push(effectValueSynergy(value, upgrade, EffectValueUpgradeType.RuneLevel, false, source, stat, EffectValueValueType.Damage));
}

export const DATA_RUNE: { [key: number]: DataRune } = {
    4: {
        override: rune => {
            setStat(rune, 0, 'trigger_effect_rune_cooldown_reduction');
        }
    },
    8: {
        override: rune => {
            setType(rune, 0, EffectValueType.Variable);
            setPercent(rune, 0, true);
            rune.values[1] = effectValueSynergy(100, 0, EffectValueUpgradeType.None, false, 'elemental_damage', 'elemental_damage');
            addConstant(rune, 1.5, 'garbage_stat', EffectValueValueType.AreaOfEffect);
            addVariable(rune, 20, 3, 'firework_trigger_chance', EffectValueValueType.Stat);
        }
    },
    13: {
        override: rune => {
            setStat(rune, 1, 'elemental_damage');
            setType(rune, 2, EffectValueType.Variable);
        }
    },
    15: {
        override: rune => {
            setStat(rune, 0, 'physical_damage');
            setStat(rune, 1, 'elemental_damage');
            setValue(rune, 1, 50);
            rune.values[2] = effectValueVariable(50, 0, EffectValueUpgradeType.RuneLevel, true, 'garbage_stat');
            rune.values[3] = effectValueVariable(75, 0, EffectValueUpgradeType.RuneLevel, true, 'garbage_stat');
            rune.values[4] = effectValueVariable(0, 5, EffectValueUpgradeType.RuneLevel, true, 'garbage_stat');
        }
    },
    16: {
        override: rune => {
            setValue(rune, 0, 0);
            setUpgrade(rune, 0, 5000);
            setPercent(rune, 0, false);
            setType(rune, 0, EffectValueType.Variable);
            addSynergy(rune, 100, 0, 'victims_current_reaper', 'elemental_damage')
        }
    },
    18: {
        override: rune => {
            setValue(rune, 0, 200);
            setUpgrade(rune, 0, 0);
            addVariable(rune, 5, 1, 'duration', EffectValueValueType.Duration, false);
            addConstant(rune, 1.5, 'garbage_stat', EffectValueValueType.AreaOfEffect);
        }
    },
    20: {
        override: rune => {
            rune.values.unshift(effectValueVariable(1, 1, EffectValueUpgradeType.Every5RuneLevel, false, 'max_skeleton_count'));
            setValue(rune, 1, 40);
            setUpgrade(rune, 1, 0);
        }
    }
}