'use strict';

import Abilities from './abilities';

const alignmentErr = new ReferenceError('Sorry, that is not a valid alignment');
const aDie = require('d20');
const defaultArmorClass = 10;
const defaultHitPoints = 5;
const pointOfDeath = 0;


export default class Character extends Abilities {

    constructor(name, alignment, armorClass, hitPoints) {
        super();
        this.name = name;
        this.alignment = alignment;
        this.armorClass = armorClass || defaultArmorClass;
        this.hitPoints = hitPoints || defaultHitPoints;
// this.abilities = new Abilities();
    }

    get alignment() { return this._alignment; }
    set alignment(value) {
        value = this.validateAlignments(value);

        this._alignment = value;
    }

    get hitPoints() { return this._hitPoints; }
    set hitPoints(value) { this._hitPoints = value; }

    validateAlignments(value) {
        const validAlignments = ['good', 'evil', 'neutral'];
        let localAlignment = String(value);

        if (!(validAlignments.includes(localAlignment.toLocaleLowerCase()))) {
            throw new ReferenceError('Sorry, that is not a valid alignment');
        }
        return value;
    }

    modifyAttackRoll(attacker, attackRoll, numberOfSides) {
        let strengthModifier = 0;

        attackRoll = this.isADieRollNeeded(numberOfSides, attackRoll);

        strengthModifier = attacker.modifier(attacker.strength);

        attackRoll.modifiedRoll = attackRoll.originalRoll + strengthModifier;

        return attackRoll;
    }

    attack(defender, attackRoll, attacker) {
        let didItHit = false,
        damage = 0;

// consider: calling modifyAttackRoll from in here, instead of making callers do it?

        didItHit = this.doesHitLand(defender, attackRoll);

        if (didItHit) {
            damage = this.calcDamage(attacker, attackRoll);
            
            return this.deductHitPoints(defender, attackRoll, damage); 
        }
        return defender;
    }


// attackRoll method?
    isADieRollNeeded(numberOfSides, attackRoll) {
        if (isNaN(attackRoll.originalRoll)) {
            attackRoll.originalRoll = attackRoll.rollADie(numberOfSides);
            return attackRoll;
        }
        return attackRoll;
    }

    doesHitLand(defender, attackRoll) {
        return attackRoll.modifiedRoll >= defender.armorClass;
    }

    deductHitPoints(defender, attackRoll, damage) {
        if (attackRoll.originalRoll === 20) {
            defender.hitPoints -= damage * 2;
        }
        else {
            defender.hitPoints -= damage;
        }
        return defender;
    }

    calcDamage(attacker, attackRoll) {
        
        let damage = 1,
            originalRoll = attackRoll.originalRoll;

        if (originalRoll === 20) {
            damage += (attacker.modifier(attacker.strength) * 2);
        }
        else {
            damage += attacker.modifier(attacker.strength);
        }

        if (damage < 1) {
            damage = 1;
        }
        return damage;
    }

    isAlive() { 
        return this.hitPoints > pointOfDeath;
    }
};