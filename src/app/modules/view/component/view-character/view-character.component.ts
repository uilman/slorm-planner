import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Character } from '../../../slormancer/model/character';
import { MinMax } from '../../../slormancer/model/minmax';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';

@Component({
  selector: 'app-view-character',
  templateUrl: './view-character.component.html',
  styleUrls: ['./view-character.component.scss']
})
export class ViewCharacterComponent {

    public readonly PHYSICAL_DAMAGE_LABEL = this.slormancerTranslateService.translate('tt_physical_damage');
    public readonly ELEMENTAL_DAMAGE_LABEL = this.slormancerTranslateService.translate('tt_elemental_damage');
    public readonly MAX_LIFE_LABEL = this.slormancerTranslateService.translate('max_health');
    public readonly MAX_MANA_LABEL = this.slormancerTranslateService.translate('max_mana');
    public readonly MAX_ARMOR_LABEL = this.slormancerTranslateService.translate('armor');
    public readonly MAX_DODGE_LABEL = this.slormancerTranslateService.translate('dodge');
    public readonly MAX_ELEMENTAL_RESISTANCE_LABEL = this.slormancerTranslateService.translate('elemental_resist');


    public readonly character: Character;

    constructor(activatedRoute: ActivatedRoute,
                private slormancerTranslateService: SlormancerTranslateService) {
        this.character = activatedRoute.snapshot.data['character'];

        console.log(this.character);
    }

    private getStat(stat: string): number | MinMax {
        let result: number | MinMax = 0;

        const found = this.character.stats.find(mergedStat => mergedStat.stat === stat);
        if (found) {
            result = found.total;
        }

        return result;
    }

    private valueToString(value: number | MinMax): string {
        return typeof value === 'number' ? value.toString() : value.min + '-' + value.max;
    }

    public getPhysicalDamages(): string {
        return this.valueToString(this.getStat('physical_damage'));
    }

    public getElementalDamages(): string {
        return this.valueToString(this.getStat('elemental_damage'));
    }

    public getMaximumLife(): string {
        return this.valueToString(this.getStat('max_health'));
    }

    public getMaximumMana(): string {
        return this.valueToString(this.getStat('max_mana'));
    }

    public getArmor(): string {
        return this.valueToString(this.getStat('armor'));
    }

    public getDodge(): string {
        return this.valueToString(this.getStat('dodge'));
    }

    public getElementalResistance(): string {
        return this.valueToString(this.getStat('elemental_resist'));
    }
}
