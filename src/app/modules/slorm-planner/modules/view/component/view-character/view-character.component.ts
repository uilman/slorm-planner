import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BuildStorageService } from '@shared/services/build-storage.service';
import { BuildService } from '@shared/services/build.service';
import {
    ALL_ATTRIBUTES,
    AncestralLegacy,
    Attribute,
    Character,
    COMBAT_CONFIG,
    DEFAULT_CONFIG,
    isNotNullOrUndefined,
    MinMax,
    Skill,
    SkillUpgrade,
    SlormancerCharacterUpdaterService,
    SlormancerDpsService,
    SlormancerTranslateService,
} from 'slormancer-api';

// TODO
// trouver formules réductions défenses

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

    public readonly ALL_ATTRIBUTES = ALL_ATTRIBUTES;

    public readonly character: Character;

    public showSummary: boolean = true;

    public readonly combatBuffControl = new FormControl(false);

    constructor(activatedRoute: ActivatedRoute,
                private router: Router,
                private buildStorageService: BuildStorageService,
                private buildService: BuildService,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private slormancerDpsService: SlormancerDpsService,
                private slormancerTranslateService: SlormancerTranslateService) {
        this.character = activatedRoute.snapshot.data['character'];

        this.combatBuffControl.valueChanges.subscribe(() => this.updateConfiguration());
        this.updateConfiguration();
    }

    private updateConfiguration() {
        let config = this.combatBuffControl.value ? { ...COMBAT_CONFIG } : { ...DEFAULT_CONFIG };

        const highestManaCost = [
            this.character.primarySkill,
            this.character.secondarySkill,
            this.character.activable1,
            this.character.activable2,
            this.character.activable3,
            this.character.activable4
        ]   .filter(isNotNullOrUndefined)
            .map(skill => 'manaCost' in skill ? skill.manaCost : skill.cost)
            .filter(isNotNullOrUndefined);
        config.minimum_unreserved_mana = Math.max(...highestManaCost, 0);

        this.slormancerCharacterUpdaterService.updateCharacter(this.character, config);

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
        const critChance = <number>this.getStat('critical_chance');
        const critDamage = <number>this.getStat('critical_damage');
        const brutChance = <number>this.getStat('ancestral_chance');
        const brutDamage = <number>this.getStat('ancestral_damage');
        const damages = this.getStat('physical_damage');
        
        return this.valueToString(Math.round(this.slormancerDpsService.getAverageHitDamage(damages, critChance, brutChance, critDamage, brutDamage)));
    }

    public getElementalDamages(): string {
        const critChance = <number>this.getStat('critical_chance');
        const critDamage = <number>this.getStat('critical_damage');
        const brutChance = <number>this.getStat('ancestral_chance');
        const brutDamage = <number>this.getStat('ancestral_damage');
        const damages = this.getStat('elemental_damage');
        
        return this.valueToString(Math.round(this.slormancerDpsService.getAverageHitDamage(damages, critChance, brutChance, critDamage, brutDamage)));
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

    public getSkillUpgrades(skill: Skill | null): Array<SkillUpgrade> {
        let upgrades: Array<SkillUpgrade> = [];

        const skillAndUpgrades = this.character.skills.find(s => s.skill === skill);
        if (skillAndUpgrades) {
            upgrades = skillAndUpgrades.upgrades.filter(upgrade => skillAndUpgrades.selectedUpgrades.includes(upgrade.id));
        }

        return upgrades;
    }

    public getAncestralLegacies(): Array<AncestralLegacy> {
        return this.character.ancestralLegacies.ancestralLegacies
            .filter(ancestralLegacy => this.character.ancestralLegacies.activeAncestralLegacies.includes(ancestralLegacy.id));
    }

    public showAttribute(attribute: Attribute): boolean {
        const traits = this.character.attributes.allocated[attribute];
        return traits.rank > 0;
    }

    public import() {
        const build = this.buildService.createBuildWithCharacter('Imported build', 'Imported layer', this.character);

        this.buildStorageService.addBuild(build);
        
        this.router.navigate(['slorm-planner', 'build']);
    }
}
