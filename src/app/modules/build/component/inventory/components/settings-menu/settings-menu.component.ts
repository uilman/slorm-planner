import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import {
    CharacterLevelEditModalComponent,
} from '../../../../../shared/components/character-level-edit-modal/character-level-edit-modal.component';
import { MessageService } from '../../../../../shared/services/message.service';
import { PlannerService } from '../../../../../shared/services/planner.service';
import { Character } from '../../../../../slormancer/model/character';
import { AttributeTraits } from '../../../../../slormancer/model/content/attribut-traits';
import { ALL_ATTRIBUTES } from '../../../../../slormancer/model/content/enum/attribute';
import { EquipableItem } from '../../../../../slormancer/model/content/equipable-item';
import { Skill } from '../../../../../slormancer/model/content/skill';
import { SlormancerItemService } from '../../../../../slormancer/services/content/slormancer-item.service';
import { isNotNullOrUndefined } from '../../../../../slormancer/util/utils';


@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss']
})
export class SettingsMenuComponent extends AbstractUnsubscribeComponent implements OnInit {

    public character: Character | null = null;

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null;

    constructor(private plannerService: PlannerService,
                private dialog: MatDialog,
                private messageService: MessageService,
                private slormancerItemService: SlormancerItemService
                ) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public openCharacterSettings(): boolean {
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }

    public editCharacterLevel() {
        if (this.character !== null) {
            this.dialog.open(CharacterLevelEditModalComponent, { data: { level: this.character.level } })
            .afterClosed().subscribe(level => {
                if (level && this.character !== null) {
                    this.character.level = level;
                }
            });
        }
    }

    public getGearItems(): Array<EquipableItem> {
        let result: Array<EquipableItem> = [];

        if (this.character !== null) {
            result = [
                this.character.gear.amulet,
                this.character.gear.belt,
                this.character.gear.body,
                this.character.gear.boot,
                this.character.gear.bracer,
                this.character.gear.cape,
                this.character.gear.glove,
                this.character.gear.helm,
                this.character.gear.ring_l,
                this.character.gear.ring_r,
                this.character.gear.shoulder,
            ].filter(isNotNullOrUndefined);
        }

        return result;
    }

    public hasItems(): boolean {
        return this.getGearItems().length > 0;
    }
    
    public optimizeReaperEnchantments() {
        if (this.character !== null && this.character.reaper !== null) {
            const reaperEnchantment = this.slormancerItemService.getReaperEnchantment(this.character.reaper.smith.id, 5);
            let icon = '';

            this.getGearItems().forEach(item => {
                item.reaperEnchantment = this.slormancerItemService.getReaperEnchantmentClone(reaperEnchantment);
                this.slormancerItemService.updateEquippableItem(item);
                icon = item.reaperEnchantment.icon;
            });

            this.messageService.message('All equipped items optimized for <img src="' + icon + '"> ' + this.character.reaper.smith.name);
            
        }
    }

    public getTraits(): Array<AttributeTraits> {
        let result: Array<AttributeTraits> = [];

        const character = this.character;
        if (character !== null) {
            result = ALL_ATTRIBUTES.map(attribute => character.attributes[attribute]);
        }

        return result;
    }
    
    public optimizeAttributeEnchantments(traits: AttributeTraits) {
        if (this.character !== null && this.character.reaper !== null) {
            const attributeEnchantment = this.slormancerItemService.getAttributeEnchantment(traits.attribute, 3);
            let icon = '';

            this.getGearItems().forEach(item => {
                item.attributeEnchantment = this.slormancerItemService.getAttributeEnchantmentClone(attributeEnchantment);
                this.slormancerItemService.updateEquippableItem(item);
                icon = item.attributeEnchantment.icon;
            });

            this.messageService.message('All equipped items optimized for <img src="' + icon + '"> ' + traits.attributeName);
            
        }
    }

    public getSkills(): Array<Skill> {
        let result: Array<Skill> = [];

        const character = this.character;
        if (character !== null) {
            result = character.skills.map(skillsAndPassives => skillsAndPassives.skill);
        }

        return result;
    }
    
    public optimizeSkillEnchantments(skill: Skill) {
        if (this.character !== null) {
            const skillEnchantment = this.slormancerItemService.getSkillEnchantment(skill.id, 2);
            let icon = '';

            this.getGearItems().forEach(item => {
                item.skillEnchantment = this.slormancerItemService.getSkillEnchantmentClone(skillEnchantment);
                this.slormancerItemService.updateEquippableItem(item);
                icon = item.skillEnchantment.icon;
            });

            this.messageService.message('All equipped items optimized for <img src="' + icon + '"> ' + skill.name);
            
        }
    }
}
    