
const CharacterCard = {
    name: "Snortleblat",
    class: "Swamp Beast Diplomat",
    level: 5,
    health: 100,

    attacked: function () {
      this.health -= 20;
      if (this.health <= 0) {
          this.health = 0;
      }      document.querySelector(".health").innerHTML = `<strong>Health:</strong> ${this.health}`;
      if (this.health <= 0) {
         setTimeout(() => {
            alert("Character died");
          }, 0);
      }
      
    },

    LevelUp: function () {
      this.level++;
      document.querySelector(".level").innerHTML = `<strong>Level:</strong> ${this.level}`;
    }

};


document.querySelector(".name").textContent = CharacterCard.name;
document.querySelector(".class").innerHTML = `<strong>Class:</strong> ${CharacterCard.class}`;
document.querySelector(".level").innerHTML = `<strong>Level:</strong> ${CharacterCard.level}`;
document.querySelector(".health").innerHTML = `<strong>Health:</strong> ${CharacterCard.health}`;