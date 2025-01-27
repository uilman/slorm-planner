import { Component, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    Affix,
    Attribute,
    Character,
    DEFAULT_CONFIG,
    EquipableItem,
    LegendaryEffect,
    MAX_EPIC_STATS,
    MAX_ITEM_LEVEL,
    MAX_MAGIC_STATS,
    MAX_RARE_STATS,
    Rarity,
    ReaperSmith,
    SlormancerAffixService,
    SlormancerCharacterUpdaterService,
    SlormancerDataService,
    SlormancerItemService,
    SlormancerLegendaryEffectService,
    valueOrNull,
} from 'slormancer-api';

import { BuildStorageService } from '../../services/build-storage.service';
import { FormOptionsService } from '../../services/form-options.service';

export interface ItemEditModalData {
    character: Character,
    item: EquipableItem;
    maxLevel: number;
}

@Component({
  selector: 'app-item-edit-modal',
  templateUrl: './item-edit-modal.component.html',
  styleUrls: ['./item-edit-modal.component.scss']
})
export class ItemEditModalComponent {

    public readonly MAX_ITEM_LEVEL = MAX_ITEM_LEVEL;

    private readonly originalItem: EquipableItem;

    public readonly maxLevel: number;

    private maxBasicStats: number = 0;

    public alreadyUsedStats: Array<string> = [];

    private character: Character;

    public item: EquipableItem;

    public form!: FormGroup;

    constructor(private dialogRef: MatDialogRef<ItemEditModalComponent>,
                private slormancerCharacterUpdaterService: SlormancerCharacterUpdaterService,
                private slormancerItemService: SlormancerItemService,
                private slormancerDataService: SlormancerDataService,
                private slormancerAffixService: SlormancerAffixService,
                private slormancerLegendaryEffectService: SlormancerLegendaryEffectService,
                private formOptionsService: FormOptionsService,
                private buildStorageService: BuildStorageService,
                @Inject(MAT_DIALOG_DATA) data: ItemEditModalData
                ) {
        this.originalItem = data.item;
        this.maxLevel = data.maxLevel;

        this.item = this.slormancerItemService.getEquipableItemClone(this.originalItem);
        this.character = data.character;
        this.reset();

        // TODO
        
        // reflechir composant pour gérer stat par rareté
        // rajouter minLevel sur EffectValue et minLevel sur item
        // et du coup rajouter stats par level
        // mettre css no error padding sur champs pour gagner de la place

        // mettre en hint le niveau minimum
    }
    
    public reset() {
        Object.assign(this.item, this.slormancerItemService.getEquipableItemClone(this.originalItem));
        this.form = this.buildForm();
    }

    public submit() {
        if (this.form.valid) {
            this.dialogRef.close(this.item);
        }
    }

    private updatePreview(form: FormGroup) {
        const item = this.item;
        if (form.valid) {
            const value = form.value;
            item.level = value.level;
            item.reinforcment = value.reinforcment;

            item.affixes.forEach((affix, index) => {
                const control = <FormGroup | null>form.get('affixes.' + index);

                if (control !== null) {
                    const purity = (<FormControl>control.get('purity')).value;
                    const val = (<FormControl>control.get('value')).value;
                    const stat =(<FormControl>control.get('stat')).value;
                    const rarity = (<FormControl>control.get('rarity')).value;

                    if (affix.craftedEffect.effect.stat !== stat) {
                        const newAffix = this.slormancerAffixService.getAffixFromStat(stat, item.level, item.reinforcment, rarity, val);
                        if (newAffix !== null) {
                            item.affixes[index] = newAffix;
                            affix = newAffix;
                        }
                    }

                    affix.craftedEffect.craftedValue = val;
                    affix.pure = purity;                   
                }
            });

            if (value.legendaryEffect !== null) {
                const id: number | null = value.legendaryEffect.id;
                const val: number = value.legendaryEffect.value;

                if (id === null) {
                    item.legendaryEffect = null;
                } else {
                    if (item.legendaryEffect === null || item.legendaryEffect.id !== id) {
                        item.legendaryEffect = this.slormancerLegendaryEffectService.getLegendaryEffectById(id, val, item.reinforcment, item.heroClass);
                    } else {
                        item.legendaryEffect.value = val;
                    }
                }
            }
            
            if (value.reaper !== null) {
                const smith: ReaperSmith | null = value.reaper.smith;
                const val: number = value.reaper.value;

                if (smith === null) {
                    item.reaperEnchantment = null;
                } else {
                    if (item.reaperEnchantment === null || item.reaperEnchantment.craftedReaperSmith !== smith) {
                        item.reaperEnchantment = this.slormancerItemService.getReaperEnchantment(smith, val);
                    } else {
                        item.reaperEnchantment.craftedValue = val;
                    }
                }
            }
            
            if (value.skill !== null) {
                const skillId: number | null = value.skill.skill;
                const val: number = value.skill.value;

                if (skillId === null) {
                    item.skillEnchantment = null;
                } else {
                    if (item.skillEnchantment === null || item.skillEnchantment.craftedSkill !== skillId) {
                        item.skillEnchantment = this.slormancerItemService.getSkillEnchantment(skillId, val);
                    } else {
                        item.skillEnchantment.craftedValue = val;
                    }
                }
            }
            
            if (value.attribute !== null) {
                const attribute: Attribute | null = value.attribute.attribute;
                const val: number = value.attribute.value;

                if (attribute === null) {
                    item.attributeEnchantment = null;
                } else {
                    if (item.attributeEnchantment === null || item.attributeEnchantment.craftedAttribute !== attribute) {
                        item.attributeEnchantment = this.slormancerItemService.getAttributeEnchantment(attribute, val);
                    } else {
                        item.attributeEnchantment.craftedValue = val;
                    }
                }
            }


            this.alreadyUsedStats = item.affixes.map(affix => affix.craftedEffect.effect.stat);

            this.slormancerItemService.updateEquipableItemModel(item);
            
            const build = this.buildStorageService.getBuild();
            this.slormancerCharacterUpdaterService.updateCharacter(this.character, build !== null ? build.configuration : DEFAULT_CONFIG, false, item);

            this.slormancerItemService.updateEquipableItemView(item);
        }
    }

    private affixToForm(affix: Affix): FormGroup {
        return new FormGroup({
            rarity: new FormControl(affix.rarity),
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
        let form: FormGroup | null = null;
        
        const newForm = new FormGroup({
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

        newForm.valueChanges.subscribe(() => {
            this.updatePreview(newForm);
        });
        this.updatePreview(newForm);

        this.maxBasicStats = this.slormancerDataService.getBaseMaxBasicStat(this.item.base);

        form = newForm;

        return form;
    }

    public getAffixControls(): Array<FormGroup> {
        const affixes = <FormArray | null>this.form.get('affixes');
        return affixes !== null ? <Array<FormGroup>>affixes.controls : [];
    }

    public isBasicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Normal;
    }

    public hasBasicStats(): boolean {
        return this.getAffixControls().filter(control => this.isBasicStat(control)).length > 0
    }

    public hasMaximumBasicStats(): boolean {
        return this.getAffixControls().filter(control => this.isBasicStat(control)).length >= this.maxBasicStats;
    }

    public isMagicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Magic;
    }

    public hasMagicStats(): boolean {
        return this.getAffixControls().filter(control => this.isMagicStat(control)).length > 0
    }

    public hasMaximumMagicStats(): boolean {
        return this.getAffixControls().filter(control => this.isMagicStat(control)).length >= MAX_MAGIC_STATS;
    }

    public isRareStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Rare;
    }

    public hasRareStats(): boolean {
        return this.getAffixControls().filter(control => this.isRareStat(control)).length > 0
    }

    public hasMaximumRareStats(): boolean {
        return this.getAffixControls().filter(control => this.isRareStat(control)).length >= MAX_RARE_STATS;
    }

    public isEpicStat(affixForm: AbstractControl): boolean {
        const control = affixForm.get('rarity');
        return control !== null && control.value === Rarity.Epic;
    }

    public hasEpicStats(): boolean {
        return this.getAffixControls().filter(control => this.isEpicStat(control)).length > 0
    }

    public hasMaximumEpicStats(): boolean {
        return this.getAffixControls().filter(control => this.isEpicStat(control)).length >= MAX_EPIC_STATS;
    }

    public getAffix(index: number): Affix | null {
        return this.item === null ? null : valueOrNull(this.item.affixes[index]);
    }

    public removeAffix(index: number) {
        const formAffixes = <FormArray | null>(this.form.get('affixes'));
        if (formAffixes !== null) {
            formAffixes.removeAt(index);
            this.item.affixes.splice(index, 1);
            this.updatePreview(this.form);
        }
    }

    private addAffix(rarity: Rarity) {
        const formAffixes = <FormArray | null>this.form.get('affixes');
        const possibleStats = this.formOptionsService.getStatsOptions(this.item.base, rarity)
            .filter(option => this.alreadyUsedStats.indexOf(option.value) === -1);

        const stat = possibleStats[0];
        if (stat && formAffixes !== null) {
            const affix = this.slormancerAffixService.getAffixFromStat(stat.value, this.item.level, this.item.reinforcment, rarity, 1000);

            if (affix !== null) {
                this.item.affixes.push(affix);
                formAffixes.push(this.affixToForm(affix));

                this.updatePreview(this.form);
            }
        }
    }

    public addBasicAffix() {
        this.addAffix(Rarity.Normal);
    }

    public addMagicAffix() {
        this.addAffix(Rarity.Magic);
    }

    public addRareAffix() {
        this.addAffix(Rarity.Rare);
    }

    public addEpicAffix() {
        this.addAffix(Rarity.Epic);
    }

    public getLegendaryEffectForm(): FormGroup | null {
        return <FormGroup | null>(this.form === null ? null : this.form.get('legendaryEffect'));
    }

    public getReaperEnchantmentForm(): FormGroup | null {
        return <FormGroup | null>(this.form === null ? null : this.form.get('reaper'));
    }

    public getSkillEnchantmentForm(): FormGroup | null {
        return <FormGroup | null>(this.form === null ? null : this.form.get('skill'));
    }

    public getAttributeEnchantmentForm(): FormGroup | null {
        return <FormGroup | null>(this.form === null ? null : this.form.get('attribute'));
    }
}
