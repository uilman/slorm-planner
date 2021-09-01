import { DataActivable } from '../../model/data/data-activable';
import { AbstractEffectValue } from '../../model/effect-value';
import { EffectValueValueType } from '../../model/enum/effect-value-value-type';
import { effectValueConstant } from '../../util/effect-value.util';


function addConstant(values: Array<AbstractEffectValue>, value: number, percent: boolean, valueType: EffectValueValueType, stat: string | null = null) {
    values.push(effectValueConstant(value, percent, stat, valueType));
}

export const DATA_ACTIVABLE: { [key: string]: DataActivable } = {
    10: {
        override: values => {
            addConstant(values, 2, false, EffectValueValueType.Stat, '');
        }
    }
}