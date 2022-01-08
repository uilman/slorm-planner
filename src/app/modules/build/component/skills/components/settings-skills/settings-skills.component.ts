import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { takeUntil } from 'rxjs/operators';
import {
    SlormancerCharacterModifierService,
} from 'src/app/modules/slormancer/services/slormancer-character.modifier.service';

import {
    AbstractUnsubscribeComponent,
} from '../../../../../shared/components/abstract-unsubscribe/abstract-unsubscribe.component';
import { BuildService } from '../../../../../shared/services/build.service';
import { MessageService } from '../../../../../shared/services/message.service';
import { Character, CharacterSkillAndUpgrades } from '../../../../../slormancer/model/character';
import { SkillType } from '../../../../../slormancer/model/content/skill-type';
import { SlormancerSkillService } from '../../../../../slormancer/services/content/slormancer-skill.service';


@Component({
  selector: 'app-settings-skills',
  templateUrl: './settings-skills.component.html',
  styleUrls: ['./settings-skills.component.scss']
})
export class SettingsSkillsComponent extends AbstractUnsubscribeComponent implements OnInit {

    @Input()
    public selectedSkill: CharacterSkillAndUpgrades | null = null;

    public character: Character | null = null;

    @ViewChild(MatMenuTrigger, { static: true })
    private menu: MatMenuTrigger | null = null;

    constructor(private plannerService: BuildService,
                private messageService: MessageService,
                private slormancerSkillService: SlormancerSkillService,
                private slormancerCharacterModifierService: SlormancerCharacterModifierService
                ) {
        super();
    }

    public ngOnInit() {
        this.plannerService.characterChanged
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(character => this.character = character);
    }

    public openSettings(): boolean {
        if (this.menu !== null) {
            this.menu.openMenu();
        }
        return false;
    }

    public isSupport(skill: CharacterSkillAndUpgrades): boolean {
        return skill.skill.type === SkillType.Support;
    }

    public maximize(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {

            skill.skill.baseLevel = skill.skill.maxLevel;
            this.slormancerSkillService.updateSkillModel(skill.skill);
            for (const upgrade of skill.upgrades) {
                upgrade.baseRank = upgrade.maxRank;
                this.slormancerSkillService.updateUpgrade(upgrade);
            }

            this.plannerService.updateCurrentCharacter();

            this.messageService.message('Skill and upgrades set to max rank for <img src="assets/img/icon/' + skill.skill.icon + '.png"/> ' + skill.skill.name);
        }
    }

    public equipSupport(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            if (this.slormancerCharacterModifierService.setSupportSkill(this.character, skill.skill)) {
                this.messageService.message('Skill equipped as support : <img src="assets/img/icon/' + skill.skill.icon + '.png"/> ' + skill.skill.name);
                this.plannerService.updateCurrentCharacter();
            }
        }
    }

    public equipPrimary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            if (this.slormancerCharacterModifierService.setPrimarySkill(this.character, skill.skill)) {
                this.messageService.message('Skill equipped as primary : <img src="assets/img/icon/' + skill.skill.icon + '.png"/> ' + skill.skill.name);
                this.plannerService.updateCurrentCharacter();
            }
        }
    }

    public equipSecondary(skill: CharacterSkillAndUpgrades) {
        if (this.character !== null) {
            if (this.slormancerCharacterModifierService.setSecondarySkill(this.character, skill.skill)) {
                this.messageService.message('Skill equipped as secondary : <img src="assets/img/icon/' + skill.skill.icon + '.png"/> ' + skill.skill.name);
                this.plannerService.updateCurrentCharacter();
            }
        }
    }
    
    public isEquippedSupportSkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.supportSkill === skill.skill;
    }
    
    public isEquippedPrimarySkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.primarySkill === skill.skill;
    }
    
    public isEquippedSecondarySkill(skill: CharacterSkillAndUpgrades): boolean {
        return this.character !== null && this.character.secondarySkill === skill.skill;
    }
}
    
