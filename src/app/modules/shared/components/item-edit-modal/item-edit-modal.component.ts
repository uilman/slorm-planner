import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAX_EPIC_STATS, MAX_ITEM_LEVEL, MAX_MAGIC_STATS, MAX_RARE_STATS } from '../../../slormancer/constants/common';
import { Affix } from '../../../slormancer/model/content/affix';
import { Rarity } from '../../../slormancer/model/content/enum/rarity';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';
import { LegendaryEffect } from '../../../slormancer/model/content/legendary-effect';
import { SlormancerAffixService } from '../../../slormancer/services/content/slormancer-affix.service';
import { SlormancerDataService } from '../../../slormancer/services/content/slormancer-data.service';
import { SlormancerItemService } from '../../../slormancer/services/content/slormancer-item.service';
import { SlormancerTranslateService } from '../../../slormancer/services/content/slormancer-translate.service';
import { compareString, isFirst, valueOrDefault } from '../../../slormancer/util/utils';

export interface ItemEditModalData {
    item: EquipableItem;
    baseLocked: boolean;
    maxLevel: number;
}

interface SelectOption<T> {
    label: string;
    triggered?: string;
    value: T;
    disabled: boolean;
}

@Component({
  selector: 'app-item-edit-modal',
  templateUrl: './item-edit-modal.component.html',
  styleUrls: ['./item-edit-modal.component.scss']
})
export class ItemEditModalComponent {

    public readonly MAX_ITEM_LEVEL = MAX_ITEM_LEVEL;

    public readonly originalItem: EquipableItem;

    public readonly baseLocked: boolean;

    public readonly maxLevel: number;

    private maxBasicStats: number = 0;

    private statOptions: { [key: number]: Array<SelectOption<string>> } = {};

    private craftOptions: { [key: number]: Array<SelectOption<number>> } = {};

    public item: EquipableItem;

    public form: FormGroup;

    constructor(public dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerItemService: SlormancerItemService,
                private slormancerAffixService: SlormancerAffixService,
                private slormancerDataService: SlormancerDataService,
                private slormancerTranslateService: SlormancerTranslateService,
                @Inject(MAT_DIALOG_DATA) public data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.baseLocked = data.baseLocked;
        this.maxLevel = data.maxLevel;

        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.buildForm();
    }

    public reset() {
        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.form = this.buildForm();
    }

    public submit() {
        this.dialogRef.close(this.item);
    }

    private updatePreview(form: FormGroup) {
        if (form.valid) {
            const value = form.value;
            this.item.level = value.level;
            this.item.reinforcment = value.reinforcment;

            this.item.affixes.forEach((affix, index) => {
                const control = <FormGroup | null>form.get('affixes.' + index);

                if (control !== null) {
                    const purity = (<FormControl>control.get('purity')).value;
                    const pure = (<FormControl>control.get('pure')).value;
                    const value = (<FormControl>control.get('value')).value;
                    const stat =(<FormControl>control.get('stat')).value;

                    if (pure) {
                        affix.pure = purity;
                        affix.craftedEffect.craftedValue = affix.craftedEffect.maxPossibleCraftedValue;
                    } else {
                        affix.pure = 100;
                        affix.craftedEffect.craftedValue = value;
                    }
                    affix.craftedEffect.effect.stat = stat;
                }
            });

            this.slormancerItemService.updateEquippableItem(this.item);
        }
    }

    private buildOptions(item: EquipableItem) {
        this.craftOptions = {};
        this.statOptions = {};

        const usedStats = item.affixes.map(affix => affix.craftedEffect.effect.stat);

        item.affixes.forEach((affix, index) => {
            const percent = affix.craftedEffect.effect.percent ? '%' : '';
            this.craftOptions[index] = affix.craftedEffect.possibleCraftedValues
                .filter((value, index, values) => isFirst(value, index, values, (a, b) => a.value === b.value))
                .map(value => ({ value: value.craft, label: value.value.toString() + percent, disabled: false }));
            this.statOptions[index] = this.slormancerDataService.getAffixPossibleStats(item.base, affix.rarity)
                .map(stat => {
                    const summary = this.slormancerAffixService.getAffixValueSummary(stat, item.level, item.reinforcment, affix.rarity, affix.pure);
                    const percent = summary.percent ? '%' : '';
                    const summarylabel = '<span class="shaded">(' + summary.minMax.min + percent + '-' + summary.minMax.max + percent + ')</span>';
                    const statLabel = this.slormancerTranslateService.translate(stat)
                    return {
                        value: stat,
                        label: statLabel + ' ' + summarylabel,
                        disabled: usedStats.indexOf(stat) !== -1 && stat !== affix.craftedEffect.effect.stat
                    }
                })
                .sort((a, b) => compareString(a.label, b.label));

        });
    }

    private affixToForm(affix: Affix): FormGroup {
        return new FormGroup({
            rarity: new FormControl(affix.rarity),
            pure: new FormControl(affix.isPure),
            value: new FormControl(affix.craftedEffect.craftedValue),
            purity: new FormControl(affix.pure),
            stat: new FormControl(affix.craftedEffect.effect.stat)
        })
    }

    private legendaryEffectToForm(legendaryEffect: LegendaryEffect | null): FormGroup {
        return new FormGroup({
            id: new FormControl(legendaryEffect === null ? null : legendaryEffect.id),
            value: new FormControl(legendaryEffect === null ? 100 : legendaryEffect.value)
        })
    }

    private buildForm(): FormGroup {
        const form = new FormGroup({
            level: new FormControl(this.item.level, [Validators.required, Validators.min(1), Validators.max(this.MAX_ITEM_LEVEL), Validators.pattern(/^[0-9]+$/)]),
            reinforcment: new FormControl(this.item.reinforcment, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)]),
            affixes: new FormArray(this.item.affixes.map(affix => this.affixToForm(affix))),
            legendaryEffect: this.legendaryEffectToForm(this.item.legendaryEffect),
            reaper: new FormGroup({
                smith: new FormControl(this.item.reaperEnchantment === null ? null : this.item.reaperEnchantment.craftedReaperSmith),
                value: new FormControl(this.item.reaperEnchantment === null ? 5 : this.item.reaperEnchantment.craftedValue)
            }),
            skill: new FormGroup({
                skill: new FormControl(this.item.skillEnchantment === null ? null : this.item.skillEnchantment.craftedSkill),
                value: new FormControl(this.item.skillEnchantment === null ? 2 : this.item.skillEnchantment.craftedValue)
            }),
            attribute: new FormGroup({
                attribute: new FormControl(this.item.attributeEnchantment === null ? null : this.item.attributeEnchantment.craftedAttribute),
                value: new FormControl(this.item.attributeEnchantment === null ? 2 : this.item.attributeEnchantment.craftedValue)
            })
        });

        form.valueChanges.subscribe(() => {
            this.updatePreview(form);
            this.buildOptions(this.item);
        });
        this.updatePreview(form);
        this.buildOptions(this.item);

        this.maxBasicStats = this.slormancerDataService.getBaseMaxBasicStat(this.item.base);

        return form;
    }

    public getAffixControls(): Array<AbstractControl> {
        const affixes = <FormArray | null>this.form.get('affixes');
        return affixes !== null ? affixes.controls : [];
    }

    public isBasicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Basic;
    }

    public hasBasicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isBasicStat(control)).length > 0
    }

    public hasMaximumBasicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isBasicStat(control)).length >= this.maxBasicStats;
    }

    public isMagicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Magic;
    }

    public hasMagicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isMagicStat(control)).length > 0
    }

    public hasMaximumMagicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isMagicStat(control)).length >= MAX_MAGIC_STATS;
    }

    public isRareStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Rare;
    }

    public hasRareStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isRareStat(control)).length > 0
    }

    public hasMaximumRareStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isRareStat(control)).length >= MAX_RARE_STATS;
    }

    public isEpicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Epic;
    }

    public hasEpicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isEpicStat(control)).length > 0
    }

    public hasMaximumEpicStats(): boolean {
        const controls = <FormArray | null>this.form.get('affixes');
        return controls !== null && controls.controls.filter(control => this.isEpicStat(control)).length >= MAX_EPIC_STATS;
    }

    public getStatOptions(index: number): Array<SelectOption<string>> {
        return valueOrDefault(this.statOptions[index], []);
    }

    public getCraftOptions(index: number): Array<SelectOption<number>> {
        return valueOrDefault(this.craftOptions[index], []);
    }

    public getStatLabel(affixControl: AbstractControl): string {
        const stat = affixControl.get('stat');
        return stat === null ? '??' : this.slormancerTranslateService.translate(stat.value);
    }
}
