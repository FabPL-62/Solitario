import { Scene } from 'phaser';
import { GameConfigManager, PLAYING_CARDS_SPRITESHEET, CARD_BACKS_SPRITESHEET } from '../config/GameConfig';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo de la barra
        this.add.rectangle(width / 2, height / 2, 468, 32).setStrokeStyle(1, 0xffffff);

        // Barra de progreso
        const bar = this.add.rectangle(width / 2 - 230, height / 2, 4, 28, 0xffffff);

        // Texto de carga
        this.add.text(width / 2, height / 2 - 50, 'Cargando...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Actualizar barra de progreso
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });

        // Texto de archivo actual
        const assetText = this.add.text(width / 2, height / 2 + 50, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);

        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            assetText.setText(file.key);
        });
    }

    preload() {
        const config = GameConfigManager.instance.config.card;

        // Se selecciona aleatoriamente un spritesheet de cartas
        const cardsImagePaths = [
            'assets/playing-cards-01.png',
            'assets/playing-cards-02.png',
        ];
        const cardsImagePath = cardsImagePaths[Math.floor(Math.random() * cardsImagePaths.length)];

        // Cargar spritesheet de cartas
        this.load.spritesheet(PLAYING_CARDS_SPRITESHEET.key, cardsImagePath, {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            margin: config.spriteMarginX,
            spacing: config.spriteSpacingX,
        });

        // Cargar spritesheet de fondos de cartas
        this.load.spritesheet(CARD_BACKS_SPRITESHEET.key, CARD_BACKS_SPRITESHEET.path, {
            frameWidth: config.frameWidth,
            frameHeight: config.frameHeight,
            margin: config.spriteMarginX,
            spacing: config.spriteSpacingX,
        });
    }

    create() {
        // Verificar que los spritesheets se cargaron
        const playingCardsTexture = this.textures.get(PLAYING_CARDS_SPRITESHEET.key);
        const cardBacksTexture = this.textures.get(CARD_BACKS_SPRITESHEET.key);
        
        console.log('Spritesheet de cartas cargado:', playingCardsTexture.frameTotal, 'frames');
        console.log('Spritesheet de fondos cargado:', cardBacksTexture.frameTotal, 'frames');

        // Ir a la escena principal
        this.scene.start('Main');
    }
}
