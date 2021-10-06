import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Character } from '../../../slormancer/model/character';
import { EquipableItemBase } from '../../../slormancer/model/content/enum/equipable-item-base';
import { GearSlot } from '../../../slormancer/model/content/enum/gear-slot';
import { EquipableItem } from '../../../slormancer/model/content/equipable-item';


@Component({
  selector: 'app-character-equipment',
  templateUrl: './character-equipment.component.html',
  styleUrls: ['./character-equipment.component.scss']
})
export class CharacterEquipmentComponent {

    public readonly gearSlot = GearSlot;

    public bases = EquipableItemBase;

    @Input()
    public character: Character | null = null;

    @Input()
    public readonly: boolean = false;

    @Output()
    public changed = new EventEmitter<Character>();

    constructor() {
    }
        
    public updateItem(slot: GearSlot, item: EquipableItem | null) {
        if (this.character !== null) {
            this.character.gear[slot] = item;
            this.changed.emit(this.character);
        }
    }
}