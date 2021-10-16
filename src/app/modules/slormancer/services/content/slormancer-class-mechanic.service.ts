import { Injectable } from '@angular/core';

import { DATA_CLASS_MECHANIC } from '../../constants/content/data/data-class-mechanic';
import { ClassMechanic } from '../../model/content/class-mechanic';
import { AbstractEffectValue } from '../../model/content/effect-value';
import { HeroClass } from '../../model/content/enum/hero-class';
import { isDamageType, valueOrDefault } from '../../util/utils';
import { SlormancerDataService } from './slormancer-data.service';
import { SlormancerTemplateService } from './slormancer-template.service';

@Injectable()
export class SlormancerClassMechanicService {

    constructor(private slormancerDataService: SlormancerDataService,
                private slormancerTemplateService: SlormancerTemplateService) { }

    public getClassMechanicClone(classMechanic: ClassMechanic): ClassMechanic {
        return {
            ...classMechanic,
            values: classMechanic.values.map(value => ({ ...value }))
        }
    }

    public getClassMechanic(heroClass: HeroClass, id: number): ClassMechanic | null {
        const data = this.slormancerDataService.getGameDataSkill(heroClass, id);
        let mechanic: ClassMechanic | null = null;

        if (data !== null) {
            const values: Array<AbstractEffectValue> = valueOrDefault(DATA_CLASS_MECHANIC[heroClass][id]?.values, []);
            mechanic = {
                id: data.REF,
                name: data.EN_NAME,
                description: '',
                icon: 'skill/' + heroClass + '/' + data.REF,
                template: this.slormancerTemplateService.prepareMechanicTemplate(data.EN_DESCRIPTION, values.map(value => value.stat).filter(isDamageType)),
                values
            };

            this.updateClassMechanicView(mechanic);
        }

        return mechanic;
    }

    public updateClassMechanicView(mechanic: ClassMechanic) {
        mechanic.description = this.slormancerTemplateService.formatMechanicTemplate(mechanic.template, mechanic.values);
    }
}