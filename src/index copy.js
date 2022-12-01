//please use render :{PixelArt: true} in your config
// boiler plate phaser game https://github.com/photonstorm/phaser3-project-template.git === remove anything in preload and create
// taken from phaser 3 tutorial // https://phaser.io/tutorials/making-your-first-phaser-3-game/part1
import Phaser from 'phaser';
// we are using WEBPACK to we HAVE TO IMPORT FILES like this
import sky from "./assets/sky.png"
// import ground from "./assets/platform.png"
import ground from "./assets/platformClif.png"
// import star from "./assets/star.png"
import star from "./assets/bean.png"
// import bomb from "./assets/bomb.png"
import bomb from "./assets/booBomb1.png"
// import monkey from "./assets/dude.png"
import monkey from "./assets/dude1.png"

class MyGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        //BECAUSE OF WEB PACK we cannot add the directory === WE HAVE TO USE THE IMPORT KEY
        this.load.image('sky', sky)
        this.load.image('ground', ground)
        this.load.image('star', star)
        this.load.image('bomb', bomb)
        //sprite sheet is loaded differently
        // this.load.spritesheet("dude", monkey, {
        //     frameWidth: 32,
        //     frameHeight: 48,
        // });
        // this.load.spritesheet("dudeChill", monkey, {
        //     frameWidth: 54, //53
        //     frameHeight: 90,
        // });

        this.load.spritesheet("dude", monkey, {
            frameWidth: 55, //55
            frameHeight: 90,
        });
    }

    create() {
        // this will import the sky into background 
        this.add.image(400, 300, "sky")
        // create platforms, they need physics so that we can stand and walk on them and the stars and bombs will also COLLIDE with the Platforms
        const platforms = this.physics.add.staticGroup()

        //PLATFORMS // this is where you can generate new levels
        //(x, y, "image")
        // platforms.create(400, 568, "ground").setScale(2).refreshBody()
        platforms.create(400, 660, "ground").setScale(9).refreshBody()

        platforms.create(520, 395, "ground").setScale(2).refreshBody()
        platforms.create(90, 270, "ground").setScale(3).refreshBody()
        platforms.create(750, 220, "ground").setScale(1).refreshBody()

        //this is for the player with this.player == we are making it a property of the CLASS MyGame== do this because we also want to use t in update() === GLOBAL TO THE CLASS
        // (this creates the "HIT BOX" for the character and where you want the to SPAWN)
        this.player = this.physics.add.sprite(100, 450, "dude");
        // add physics 
        this.player.setBounce(0.2);
        // this allows it to stay inside of the world block but not the platform
        this.player.setCollideWorldBounds(true);
        // collider allows the platforms to be solid for player
        this.physics.add.collider(this.player, platforms)

        //ANIMATIONS
        //idle
        this.anims.create({
            key: "turn",
            //"dude holds all frames, 4 is the middle idle frame"
            frames: [{ key: "dude", frame: 2 }],
            // frames: [{ key: "dude", frame: 10 }],
            frameRate: 20,
        })
        //right walking
        this.anims.create({
            key: "right",
            frames: [{ key: "dude", frame: 10 }],
            frameRate: 10,
            repeat: -1,
        })
        //left walking
        this.anims.create({
            key: "left",
            frames: [{ key: "dude", frame: 8 }],
            frameRate: 10,
            //noRepeat
            repeat: -1,
        })
        //left walking
        // this.anims.create({
        //     key: "up",
        //     frames: [{ key: "dude", frame: 10 }],
        //     frameRate: 10,
        //     repeat: -1,
        // })
        // //idle
        // this.anims.create({
        //     key: "turn",
        //     //"dude holds all frames, 4 is the middle idle frame"
        //     frames: [{ key: "dude", frame: 4 }],
        //     frameRate: 20,
        // })
        // //right walking
        // this.anims.create({
        //     key: "right",
        //     frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        //     frameRate: 10,
        //     repeat: -1,
        // })
        // //left walking
        // this.anims.create({
        //     key: "left",
        //     frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        //     frameRate: 10,
        //     //noRepeat
        //     repeat: -1,
        // })
        //STARS
        //this does not have to be a GLOBAL VARIABLE === can use CONST
        const stars = this.physics.add.group({
            key: "star",
            // creates 11 stars
            repeat: 11,
            // want them to be spawned spread out throughout the game == perfectly spaced out by 70px
            setXY: { x: 12, y: 0, stepX: 70 },
        })
        // sellects all children stars
        stars.children.iterate(function (child) {
            // give them all a random bounce between o.4 and 0.8
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        })
        // stars cannot go through platforms
        this.physics.add.collider(stars, platforms)
        //overlap == overlaps the player and the stars == as player walks over them the get collected
        // collect is actually a function! 
        this.physics.add.overlap(this.player, stars, collect, null, this)

        //BOMBS
        //add group?
        const bombs = this.physics.add.group()
        this.physics.add.collider(bombs, platforms)
        //bombTouched=== function
        this.physics.add.collider(this.player, bombs, bombTouched, null, this)
        //function == gravity stops and greys out and ends turn === END GAME
        function bombTouched(player, bomb) {
            this.physics.pause()
            this.player.setTint(0xff000)
            this.player.anims.play("turn")
        }

        //SCORE TEXT
        // this creates the score board
        const scoreText = this.add.text(15, 15, "score: 0", {
            frontSize: "32px",
            fill: "#000"
        })
        // global var to start collection at 0
        let score = 0

        //STARS COLLISION
        //when collect function runs it is going to say when the player overlaps the stars === do this function
        // takes player and star parameter === disableBody === takes it opff the screen
        //disableBody?
        function collect(player, star) {
            star.disableBody(true, true)
            // this adds the scores for the stars collects
            score += 1
            // ("text in scoreboard" + actual score incrementing 1 each time)
            scoreText.setText("score: " + score)

            //this makes the bomb drop
            //if there are no stars
            if (stars.countActive(true) === 0) {
                // this speaks to all stars
                stars.children.iterate(function (child) {
                    //this just enables Body
                    child.enableBody(true, child.x, 0, true, true)
                })
                //SPAWN BOMB
                var x = player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    //if this is NOT where the player is active === SO BOMB DOESNT DROP STRAIGHT ON YOU
                    : Phaser.Math.Between(0, 400)
                //declare the bomb
                const bomb = bombs.create(x, 16, "bomb")
                bomb.setBounce(1)
                bomb.setCollideWorldBounds(true)
                //Phaser.Math.Between?
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
            }


        }
    }

    update() { // what every you want to keep running that changes every 1/60s
        //control player movement
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
            this.player.flipX = true
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
            this.player.flipX = false
        }  else {
            //this stops this continued walking
            this.player.setVelocityX(0)
            this.player.anims.play("turn")
        }

        //because JUMP is a UNIQUE button === it has nothing to do with GOING LEFT OR RIGHT!
        if (cursors.up.isDown && this.player.body.touching.down) {
            //(higher the jump to clear the platforms)
            this.player.setVelocityY(-420)
            // this.player.anims.play("up", true);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    //add physics to create game gravity
    physics: {
        default: 'arcade',
        arcade: {
            //want to always be falling down
            gravity: { y: 450 },
            debug: false
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
