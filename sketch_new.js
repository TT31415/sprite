// グローバル変数を整理し、オブジェクトにまとめる
const config = {
    canvas: {
        width: 2048,
        height: 1536
    },
    proximityDistance: 200,
    reep: {
        count: 5,
        dieDuration: 1250,
        vanishDuration: 1250,
        respawnInterval: 37,
        touchDistance: 100
    },
    rain: {
        normalCount: 900,
        y_gravity: 0.1,
        strongCount: 1500,
    },
    keypoints: { // キーポイントのインデックスを定数化
        NOSE: 0,
        LEFT_SHOULDER: 5,
        RIGHT_SHOULDER: 6,
        LEFT_WRIST: 9,
        RIGHT_WRIST: 10
    }
};

// アセット（画像、アニメーション、スプライトグループ）を管理するオブジェクト
const assets = {
    animations: {},
    images: {},
    groups: {},
    sprites: {}
};

// アプリケーションの状態を管理するオブジェクト
const state = {
    mode: 3, // 1:人(first), 2:雨(rainy), 3:工場(elecy)
    poses: [],
    lastRespawnTime: 0,
    currentFrame: null, // 最新のウェブカメラ画像を保持する変数
    detection_running: true // ポーズ検知が動いているかどうかの状態
};

// p5.jsの初期化関数
function preload() {
    // アニメーションの読み込み
    assets.animations.run = loadAnimation(loadSpriteSheet('assets/ob/run.png', 32, 32, 8));
    assets.animations.vanish = loadAnimation(loadSpriteSheet('assets/ob/vanish.png', 32, 32, 7));
    assets.animations.die = loadAnimation(loadSpriteSheet('assets/ob/die.png', 32, 32, 18));
    assets.animations.caeruEat = loadAnimation(loadSpriteSheet('assets/ob/caeru_eat.png', 32, 32, 16));
    assets.animations.rainSplash = loadAnimation(loadSpriteSheet('assets/ame/raine_jp.png', 32, 32, 8));
    assets.animations.leafUmbrella = loadAnimation(loadSpriteSheet('assets/leaf/unblera_leaf .png', 32, 32, 31));
    assets.animations.waterGrow = loadAnimation(loadSpriteSheet('assets/leaf/worter_grow.png', 32, 32, 18));
    assets.animations.coilElec = loadAnimation(loadSpriteSheet('assets/elec/coile_elec.png', 32, 32, 18));
    assets.animations.rightElec = loadAnimation(loadSpriteSheet('assets/elec/right_elec.png', 32, 32, 4));
    assets.animations.noRightElec = loadAnimation(loadSpriteSheet('assets/elec/right_eleca_no.png', 32, 32, 2));
    assets.animations.onElec = loadAnimation(loadSpriteSheet('assets/elec/on_elec.png', 96, 96, 4));
    assets.animations.pipElec = loadAnimation(loadSpriteSheet('assets/elec/pip_elec.png', 128, 128, 6));
    assets.animations.headFlower = loadAnimation(loadSpriteSheet('assets/ob/flower.png', 128, 128, 2));

    assets.animations.rainSplash.looping = false;

    // 画像の読み込み
    assets.images.rain = [
        loadImage('assets/ame/ame-1.png'), loadImage('assets/ame/ame-2.png'),
        loadImage('assets/ame/ame-3.png'), loadImage('assets/ame/ame-4.png'),
        loadImage('assets/ame/ame-5.png')
    ];
    assets.images.strongRain = [
        loadImage('assets/ame/ame-6.png'), loadImage('assets/ame/ame-7.png'),
        loadImage('assets/ame/ame-8.png')
    ];
    assets.images.oneLeaf = loadImage('assets/leaf/one_leaf.png');
    assets.images.haguruma = loadImage('assets/elec/haguruma.png');
    assets.images.onElec1 = loadImage('assets/elec/on_elec_1.png');
}

/**
 * 汎用的なグループ作成関数
 * @param {number} count - 生成するスプライトの数
 * @param {function} setupSprite - 各スプライトをセットアップする関数
 * @returns {Group} - 生成されたp5.playのGroupオブジェクト
 */
function createGroup(count, setupSprite) {
    const group = new Group();
    for (let i = 0; i < count; i++) {
        const sprite = createSprite();
        setupSprite(sprite, i);
        group.add(sprite);
    }
    return group;
}

function setup() {
    frameRate(30);
    const canvasRender = createCanvas(config.canvas.width, config.canvas.height);
    connectWebSocket(canvasRender.canvas);
    canvasRender.canvas.getContext('2d').imageSmoothingEnabled = false;

    // ----- スプライトグループの生成 -----
    assets.groups.reeps = createGroup(config.reep.count, (sp) => {
        sp.addAnimation('run', assets.animations.run);
        sp.addAnimation('vanish', assets.animations.vanish);
        sp.addAnimation('die', assets.animations.die);
        sp.position.set(random(width), random(height));
        sp.friction = random(0.03, 0.01);
        sp.maxSpeed = random(1, 4);
        sp.scale = random(4, 8);
        sp.state = 'run'; // 状態を管理するプロパティを追加
        sp.stateChangedTime = 0;
        setNewRandomTarget(sp);
    });

    assets.groups.leafGroup = createGroup(50, (sp) => {
        sp.addAnimation('open', assets.animations.leafUmbrella);
        sp.addImage('one', assets.images.oneLeaf);
        sp.addAnimation('grow', assets.animations.waterGrow);
        sp.scale = 10;
        sp.mirrorX(-1);
        sp.animation.looping = false;
        sp.setCollider('rectangle', 0, -15, 35, 10);
        sp.visible = false;
    });

    assets.groups.rightGroup = createGroup(50, (sp) => {
        sp.addAnimation('no', assets.animations.noRightElec);
        sp.addAnimation('idle', assets.animations.rightElec);
        sp.scale = 10;
        sp.visible = false;
    });

    // 左手用の稲妻アニメーショングループを新しく追加
    assets.groups.leftGroup = createGroup(50, (sp) => {
        sp.addAnimation('no', assets.animations.noRightElec);
        sp.addAnimation('idle', assets.animations.rightElec);
        sp.scale = 10;
        sp.mirrorX(-1); // 左右反転
        sp.visible = false;
    });

    assets.groups.flowerGroup = createGroup(50, (sp) => {
        sp.addAnimation('hello', assets.animations.headFlower);
        sp.scale = 1;
        sp.visible = false;
    });

    // 雨グループ
    assets.groups.rainGroup = new Group();
    assets.groups.rainSplashGroup = new Group();
    setupRain(false); // 初期は通常の雨

    // ----- 個別スプライトの生成 -----
    assets.sprites.caeruSp = createSprite(150, 300);
    assets.sprites.caeruSp.addAnimation('eat', assets.animations.caeruEat);

    assets.sprites.coilElecSp = createSprite(470, 30);
    assets.sprites.coilElecSp.addAnimation('idle', assets.animations.coilElec);
    assets.sprites.coilElecSp.animation.looping = false;

    assets.sprites.coilElecSp2 = createSprite(470, 30);
    assets.sprites.coilElecSp2.addAnimation('idle', assets.animations.coilElec);
    assets.sprites.coilElecSp2.animation.looping = false;
    assets.sprites.coilElecSp2.mirrorX(-1);

    assets.sprites.onElecSp = createSprite(75, 860);
    assets.sprites.onElecSp.addImage('start', assets.images.onElec1); // addAnimationからaddImageに変更
    assets.sprites.onElecSp.addAnimation('on', assets.animations.onElec);
    assets.sprites.onElecSp.animation.looping = false;
    assets.sprites.onElecSp.scale = 5;
    assets.sprites.onElecSp.setCollider('rectangle', 0, -7, 60, 50);

    assets.sprites.hagurumaSp = createSprite(1900, 30);
    assets.sprites.hagurumaSp.addImage(assets.images.haguruma);
    assets.sprites.hagurumaSp.rotationSpeed = 3;
    assets.sprites.hagurumaSp.setCollider('rectangle', 0, -7, 500, 500);

    assets.sprites.pipElecSp = createSprite(350, 270);
    assets.sprites.pipElecSp.addAnimation('out', assets.animations.pipElec);
    assets.sprites.pipElecSp.scale = 5;
    assets.sprites.pipElecSp.mirrorX(-1);
    assets.sprites.pipElecSp.setCollider('rectangle', 0, -37, 100, 35);

    // 初期状態のシーン設定
    changeScene(state.mode);
}

/**
 * 雨スプライトをセットアップ
 * @param {boolean} isStrong - 強い雨かどうか
 */
function setupRain(isStrong) {
    assets.groups.rainGroup.clear(); // 既存の雨をクリア
    const count = isStrong ? config.rain.strongCount : config.rain.normalCount;
    const images = isStrong ? assets.images.strongRain : assets.images.rain;

    for (let i = 0; i < count; i++) {
        const sp = createSprite(random(width), random(-height, 0));
        sp.addImage(random(images));
        sp.isStrong = isStrong;
        resetRaindrop(sp);
        assets.groups.rainGroup.add(sp);
    }
}


function draw() {
    // 描画の前にウェブカメラの映像を背景として描画
    if (!state.detection_running) {
        // システムが停止している場合の処理
        background('#e9ecef');
        const ctx = drawingContext;
        ctx.fillStyle = '#dc3545';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('システム停止中', width / 2, height / 2 - 30);
        ctx.fillStyle = '#6c757d';
        ctx.font = '24px Arial';
        ctx.fillText('検出処理が実行されていません', width / 2, height / 2 + 30);
    } else {
        if (state.currentFrame) {
            // キャンバスサイズが映像と異なる場合は調整
            if (width !== state.currentFrame.width || height !== state.currentFrame.height) {
                resizeCanvas(state.currentFrame.width, state.currentFrame.height);
            }
            background(state.currentFrame);
        } else {
            // 映像がない場合は単色で塗りつぶす
            background('#e9ecef');
        }

        // WebSocketから受け取ったポーズデータに基づいてシーンを更新
        updateScene();
        // すべてのスプライトを描画
        drawSprites();
        // 電球を最前面に描画
        assets.sprites.onElecSp.display();
    }
}

/**
 * シーン管理のメイン関数
 */
function updateScene() {
    // state.poses が空なら何もしない
    if (state.poses.length === 0) {
        // 必要なら「人物がいません」などの表示
        return;
    }

    switch (state.mode) {
        case 1:
            updateFirstScene();
            break;
        case 2:
            updateRainyScene();
            break;
        case 3:
            updateElecyScene();
            break;
    }
    updateFlowers(); // 花はどのシーンでも共通
}

/**
 * シーンを切り替える関数
 * @param {number} newMode - 新しいモード (1, 2, or 3)
 */
function changeScene(newMode) {
    state.mode = newMode;
    // すべてのグループと個別スプライトの表示状態をリセット
    Object.values(assets.groups).forEach(group => group.forEach(sp => sp.visible = false));
    Object.values(assets.sprites).forEach(sp => sp.visible = false);

    // 新しいシーンに必要なスプライトだけを表示
    switch (newMode) {
        case 1:
            assets.groups.reeps.forEach(sp => sp.visible = true);
            break;
        case 2:
            assets.groups.rainGroup.forEach(sp => sp.visible = true);
            assets.sprites.caeruSp.visible = true;
            break;
        case 3:
            assets.sprites.pipElecSp.visible = true;
            assets.sprites.hagurumaSp.visible = true;
            assets.sprites.onElecSp.visible = true;
            assets.groups.rightGroup.forEach(sp => sp.visible = true);
            assets.groups.leftGroup.forEach(sp => sp.visible = true); // 左手用のグループも表示
            assets.sprites.coilElecSp.visible = true;
            assets.sprites.coilElecSp2.visible = true;
            break;
    }
}


// ----- シーンごとの更新関数 -----

function updateFirstScene() {
    assets.groups.reeps.forEach(reep => {
        const person = getClosestPerson(reep.position);
        if (!person) return;

        const {
            rightWrist,
            leftWrist
        } = getPersonKeypoints(person);
        const currentTime = millis();

        // 状態遷移の管理
        switch (reep.state) {
            case 'run':
                // 手に触れたら 'dying' 状態へ
                if (dist(rightWrist.x, rightWrist.y, reep.position.x, reep.position.y) < config.reep.touchDistance) {
                    reep.changeAnimation('die');
                    reep.setSpeed(0, 0);
                    reep.state = 'dying';
                    reep.stateChangedTime = currentTime;
                } else {
                    // 通常の移動
                    const distanceToTarget = dist(reep.position.x, reep.position.y, reep.targetX, reep.targetY);
                    if (distanceToTarget < reep.maxSpeed * 2) {
                        setNewRandomTarget(reep);
                    }
                    reep.attractionPoint(0.2, reep.targetX, reep.targetY);
                    reep.mirrorX(reep.targetX < reep.position.x ? -1 : 1);
                }
                break;

            case 'dying':
                // 一定時間経過したら 'dead' 状態へ
                if (currentTime - reep.stateChangedTime > config.reep.dieDuration) {
                    reep.visible = false;
                    reep.state = 'dead';
                    reep.stateChangedTime = currentTime;
                }
                break;

            case 'dead':
                // 一定間隔で 'reviving' 状態へ
                if (currentTime - state.lastRespawnTime > config.reep.respawnInterval) {
                    reep.visible = true;
                    reep.changeAnimation('vanish');
                    reep.state = 'reviving';
                    reep.stateChangedTime = currentTime;
                    state.lastRespawnTime = currentTime;
                }
                break;

            case 'reviving':
                // 一定時間経過したら 'run' 状態へ
                if (currentTime - reep.stateChangedTime > config.reep.vanishDuration) {
                    reep.changeAnimation('run');
                    reep.state = 'run';
                }
                break;
        }
        reep.position.x = constrain(reep.position.x, 0, width);
        reep.position.y = constrain(reep.position.y, 0, height);
    });
}

function updateRainyScene() {
    updateRain(false); // isStrong を false に設定
    assets.groups.rainSplashGroup.forEach(sp => {
        if (sp.animation.getFrame() === sp.animation.getLastFrame()) {
            sp.remove();
        }
    });

    state.poses.forEach((person, index) => {
        const {
            rightWrist
        } = getPersonKeypoints(person);
        const umbrella = assets.groups.leafGroup[index];
        if (!umbrella) return;

        umbrella.visible = true;
        umbrella.position.set(rightWrist.x, rightWrist.y);

        // アニメーション管理
        if (umbrella.getAnimationLabel() === 'grow' && umbrella.animation.ended) {
            umbrella.changeAnimation('one');
        }
        if (Math.floor(random(1000)) === 0) {
            umbrella.changeAnimation('grow');
            umbrella.animation.rewind();
        }

        umbrella.overlap(assets.groups.rainGroup, removeRaindrop);
    });
}

function updateElecyScene() {
    const {
        onElecSp,
        hagurumaSp,
        pipElecSp,
        coilElecSp,
        coilElecSp2
    } = assets.sprites;

    // 全ての稲妻スプライトを一旦非表示にする
    assets.groups.rightGroup.forEach(sp => sp.visible = false);
    assets.groups.leftGroup.forEach(sp => sp.visible = false);

    let isAnyHandInteracting = false; // 全体のインタラクション状態を管理するフラグ

    state.poses.forEach((person, index) => {
        const {
            rightWrist,
            leftWrist
        } = getPersonKeypoints(person);

        // 右手用の稲妻スプライト
        const rightElec = assets.groups.rightGroup[index];
        const leftElec = assets.groups.leftGroup[index];

        if (!rightElec || !leftElec) return;

        rightElec.visible = true;
        leftElec.visible = true;
        rightElec.position.set(rightWrist.x, rightWrist.y);
        leftElec.position.set(leftWrist.x, leftWrist.y);

        // 手と歯車/パイプが重なっているか個別にチェック
        const isRightHandOverlapping = rightElec.overlap(hagurumaSp) || rightElec.overlap(pipElecSp);
        const isLeftHandOverlapping = leftElec.overlap(hagurumaSp) || leftElec.overlap(pipElecSp);

        if (isRightHandOverlapping || isLeftHandOverlapping) {
            isAnyHandInteracting = true;
        }

        // 歯車またはパイプに触れたときに稲妻アニメーションを切り替える
        rightElec.changeAnimation(isRightHandOverlapping ? 'idle' : 'no');
        leftElec.changeAnimation(isLeftHandOverlapping ? 'idle' : 'no');

        // 両手が近づいた時のインタラクション
        const handDist = dist(rightWrist.x, rightWrist.y, leftWrist.x, leftWrist.y);
        if (handDist < 50) { // 50は仮の閾値
            coilElecSp.visible = true;
            coilElecSp2.visible = true;
            coilElecSp.position.set((rightWrist.x + leftWrist.x) / 2, (rightWrist.y + leftWrist.y) / 2);
            coilElecSp2.position.set(coilElecSp.position.x + 35, coilElecSp.position.y);
            coilElecSp.animation.play();
            coilElecSp2.animation.play();
        } else {
            coilElecSp.visible = false;
            coilElecSp2.visible = false;
            coilElecSp.animation.stop();
            coilElecSp2.animation.stop();
        }
    });

    // 歯車またはパイプとのインタラクションに応じて電球を操作
    if (isAnyHandInteracting) {
        onElecSp.changeAnimation('on');
    } else {
        onElecSp.changeAnimation('start');
    }
}

/**
 * 鼻のキーポイントが検出された場合のみ、頭の上にお花を表示する
 */
function updateFlowers() {
    // 一旦すべて非表示
    assets.groups.flowerGroup.forEach(f => f.visible = false);
    // 検出された人数分だけ表示
    state.poses.forEach((person, index) => {
        const {
            nose
        } = getPersonKeypoints(person);
        const flower = assets.groups.flowerGroup[index];
        if (!flower) return;

        // 鼻のキーポイントが検出されている場合のみ表示
        if (nose.visible) {
            flower.visible = true;
            // 鼻の少し上に配置
            flower.position.set(nose.x, nose.y - 45);
        } else {
            // 検出されなければ非表示
            flower.visible = false;
        }
    });
}


// ----- ヘルパー関数 -----

function setNewRandomTarget(sp) {
    sp.targetX = random(width);
    sp.targetY = random(height);
}

function updateRain(isStrong) {
    for (let rainSp of assets.groups.rainGroup) {
        rainSp.position.y += rainSp.mySpeedY;
        if (isStrong) rainSp.position.x += rainSp.mySpeedX;

        const offScreen = rainSp.position.y > height + rainSp.height ||
            rainSp.position.x < -rainSp.width ||
            rainSp.position.x > width + rainSp.width;

        if (offScreen) {
            resetRaindrop(rainSp);
        }
    }
}

function resetRaindrop(raindrop) {
    raindrop.position.set(random(width), random(-raindrop.height * 2, -raindrop.height / 2));
    if (raindrop.isStrong) {
        raindrop.mySpeedY = random(5, 20);
        raindrop.mySpeedX = random(-40, -20);
    } else {
        raindrop.mySpeedY = random(5, 50);
        raindrop.mySpeedX = 0;
    }
}


function removeRaindrop(umbrella, raindrop) {
    const splash = createSprite(raindrop.position.x, raindrop.position.y);
    splash.addAnimation('splash', assets.animations.rainSplash);
    splash.scale = 0.5;
    assets.groups.rainSplashGroup.add(splash);

    resetRaindrop(raindrop);
}

function getClosestPerson(position) {
    let closestPerson = null;
    let minDistance = Infinity;

    state.poses.forEach(person => {
        // 胸の中心を計算
        const {
            rightShoulder,
            leftShoulder
        } = getPersonKeypoints(person);
        const chestX = (rightShoulder.x + leftShoulder.x) / 2;
        const chestY = (rightShoulder.y + leftShoulder.y) / 2;
        const d = dist(position.x, position.y, chestX, chestY);
        if (d < minDistance) {
            minDistance = d;
            closestPerson = person;
        }
    });
    return closestPerson;
}

function getPersonKeypoints(person) {
    // 存在しない場合に備えてデフォルト値を返す
    const defaultKp = {
        x: -1,
        y: -1,
        visible: false
    };
    return {
        nose: person.keypoints[config.keypoints.NOSE] || defaultKp,
        leftShoulder: person.keypoints[config.keypoints.LEFT_SHOULDER] || defaultKp,
        rightShoulder: person.keypoints[config.keypoints.RIGHT_SHOULDER] || defaultKp,
        leftWrist: person.keypoints[config.keypoints.LEFT_WRIST] || defaultKp,
        rightWrist: person.keypoints[config.keypoints.RIGHT_WRIST] || defaultKp,
    };
}

function connectWebSocket(canvas) {
    let socket = io("http://100.108.145.71:5000");
    socket.on('connect', function () {
        console.log('WebSocket connected');
        // 接続時にカメラ表示設定を送信
        socket.emit('camera_setting', {
            showCamera: true
        });
    });

    socket.on('pose_data', function (data) {
        updateVisualization(data);
    });
}

function updateVisualization(data) {
    state.poses = data.poses || [];
    state.detection_running = data.detection_running;

    if (data.frame) {
        // 画像データをp5.Imageオブジェクトとしてロード
        loadImage(data.frame, (img) => {
            state.currentFrame = img;
        });
    }
}
