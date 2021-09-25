import { DataActivable } from '../../../model/content/data/data-activable';
import { AbstractEffectValue } from '../../../model/content/effect-value';
import { EffectValueValueType } from '../../../model/content/enum/effect-value-value-type';
import { effectValueConstant } from '../../../util/effect-value.util';

function overrideValueTypeAndStat(effects: Array<AbstractEffectValue>, index: number, stat: string) {
    const effect = effects[index];

    if (effect) {
        effect.stat = stat;
    } else {
        throw new Error('failed to override effect stat at index ' + index + ' with : ' + stat);
    }
}


function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType));
}

export const DATA_ACTIVABLE: { [key: string]: DataActivable } = {
    0: {
        override: values => {
            overrideValueTypeAndStat(values, 0, 'golden_buff_retaliate_percent')
            overrideValueTypeAndStat(values, 1, 'golden_buff_reduced_damage_from_all_percent')
        }
    },
    10: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Stat, '');
        }
    }
}