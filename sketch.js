//スプライト名を定義してる
let coile_elec_sp;
let coile_elec_sp2;
let right_elec_sp;
let coile_elecAnim;
let right_elecAnim;
let pip_elecAnim;
let pip_elec_sp;
let pip_elec;
let haguruma_sp;
let on_elecAnim;
let on_elec_sp;
let on_elec_1;
let haguruma;
let leaf_umAnim;
let one_leaf;
let leaf_um_sp;
let worter_growAnim;
let worter_grow_ap
let caeru_sp;
let leafgroup;
let rightgroup;
let flowergroup;
let hedAnim;
let raineGroup;
let raine_jpAnim;
let raine_jpGroup;
let currentTime;
let no_right_elecAnim;

let rgh_hnx;
let rgh_hny;
let rgh_shx;
let rgh_shy;
let right_handX;
let right_handY;
let lef_hnx;
let lef_hny;
let lef_shy;
let lef_shx;
let left_handX;
let left_handY;
let mune_x;
let mune_y;
let max_x;
let min_y;
let nosex;
let nosey;

let angle = 0; //スプライトの角度の定義

const time = 1800; //だいたい1.8秒待つため

const proximityDistance = 200; //スプライトとの基準の距離を定義
const magnitude = 0.01;

let runAnim;
let speed = 30;
let reep_sp;
// m=1:人
// m=2:雨
// m=3:工場
let m = 2;

let umcount = 0;
let flcount = 0;
let rtcount = 0;

let deray = 200;

let X;
let Y;
let raine1im, raine2im, raine3im, raine4im, raine5im, raine6im, raine7im, raine8im; // 雨の画像を格納する変数
const rainenum = 900;
const raineNum = 1500;

let isUmbrellaHit = false;
let q = 1;
let grow = 1;

function preload() {
  //ここですべてのアニメーションを読み込む
  // 縦32px、横32pxのフレームが8枚
  const run = loadSpriteSheet('assets/ob/run.png', 32, 32, 8);
  runAnim = loadAnimation(run);
  const vanish = loadSpriteSheet('assets/ob/vanish.png', 32, 32, 7);
  vanishAnim = loadAnimation(vanish);
  const die = loadSpriteSheet('assets/ob/die.png', 32, 32, 18);
  dieAnim = loadAnimation(die);

  raine1im = loadImage('assets/ame/ame-1.png');
  raine2im = loadImage('assets/ame/ame-2.png');
  raine3im = loadImage('assets/ame/ame-3.png');
  raine4im = loadImage('assets/ame/ame-4.png');
  raine5im = loadImage('assets/ame/ame-5.png');
  raine6im = loadImage('assets/ame/ame-6.png');
  raine7im = loadImage('assets/ame/ame-7.png');
  raine8im = loadImage('assets/ame/ame-8.png');
  one_leaf = loadImage('assets/leaf/one_leaf.png');
  const caeru_eat = loadSpriteSheet('assets/ob/caeru_eat.png', 32, 32, 16);
  caeru_eatAnim = loadAnimation(caeru_eat);
  const raine_jp = loadSpriteSheet('assets/ame/raine_jp.png', 32, 32, 8);
  raine_jpAnim = loadAnimation(raine_jp);
  raine_jpAnim.looping = false;
  const leaf_um = loadSpriteSheet('assets/leaf/unblera_leaf .png', 32, 32, 31);
  leaf_umAnim = loadAnimation(leaf_um);
  const worter_grow = loadSpriteSheet('assets/leaf/worter_grow.png', 32, 32, 18);
  worter_growAnim = loadAnimation(worter_grow);

  haguruma = loadImage('assets/elec/haguruma.png');
  on_elec_1 = loadImage('assets/elec/on_elec_1.png')
  const coile_elec = loadSpriteSheet('assets/elec/coile_elec.png', 32, 32, 18);
  coile_elecAnim = loadAnimation(coile_elec);
  const right_elec = loadSpriteSheet('assets/elec/right_elec.png', 32, 32, 4);
  right_elecAnim = loadAnimation(right_elec);
  const right_elec_no = loadSpriteSheet('assets/elec/right_eleca_no.png', 32, 32, 2)
  no_right_elecAnim = loadAnimation(right_elec_no);
  const on_elec = loadSpriteSheet('assets/elec/on_elec.png', 96, 96, 4);
  on_elecAnim = loadAnimation(on_elec);
  const pip_elec = loadSpriteSheet('assets/elec/pip_elec.png', 128, 128, 6);
  pip_elecAnim = loadAnimation(pip_elec);

  const hed_flower = loadSpriteSheet('assets/ob/flower.png', 1568, 1568, 2);
  hedAnim = loadAnimation(hed_flower);
}

function setup() {
  frameRate(30);
  const canvasRender = createCanvas(2048, 1536);
  connectWebSocket(canvasRender.canvas)
  // 実際はカメラ画像の解像度にする必要あるかも
  // カメラ映像を1920x1080にリサイズでも
  canvasRender.canvas.getContext('2d').imageSmoothingEnabled = false;

  reeps = new Group();
  for (let i = 0; i < 5; i++) {
    const r = createSprite();
    r.addAnimation('run', runAnim);
    r.addAnimation('vanish', vanishAnim);
    r.addAnimation('die', dieAnim);
    r.visible = true;

    setSpriteProperty(r, random(0, width), random(0, height));

    r.friction = random(0.03, 0.01);
    r.maxSpeed = random(1, 4);
    r.scale = random(4, 8);

    setNewRandomTarget(r);

    reeps.add(r);
  }

  leafgroup = new Group();
  for (let i = 0; i < 50; i++) {
    leaf_um_sp = createSprite();
    leaf_um_sp.addAnimation('open', leaf_umAnim);
    leaf_um_sp.addImage('one', one_leaf);
    leaf_um_sp.addAnimation('grow', worter_growAnim);
    leaf_um_sp.scale = 3;
    leaf_um_sp.animation.looping = false;
    leaf_um_sp.debug = true;
    leaf_um_sp.visible = false;
    leaf_um_sp.setCollider('rectangle', 0, -15, 35, 10);

    leafgroup.add(leaf_um_sp);
  }

  rightgroup = new Group();
  for (let r = 0; r < 50; r++) {
    right_elec_sp = createSprite(470, 30);
    right_elec_sp.addAnimation('no', no_right_elecAnim);
    right_elec_sp.addAnimation('idle', right_elecAnim);
    right_elec_sp.visible = true;
    right_elec_sp.scale = 3;
    right_elec_sp.animation.looping = true;

    rightgroup.add(right_elec_sp);
  }

  flowergroup = new Group();
  for (let f = 0; f < 50; f++) {
    let flower = createSprite(470, 30);
    flower.addAnimation('hello', hedAnim);
    flower.visible = true;
    flower.scale = 0.2;

    flowergroup.add(flower);
  }

  caeru_sp = createSprite();
  caeru_sp.addAnimation('eat', caeru_eatAnim);

  raineGroup = new Group();
  raine_jpGroup = new Group();

  const raineImages = [
    raine1im, raine2im, raine3im, raine4im,
    raine5im,
  ];
  const raineimages = [
    raine6im, raine7im, raine8im
  ]
  if (q == 1) {
    for (let i = 0; i < rainenum; i++) {
      const sp = createSprite();
      sp.addImage(random(raineImages));
      sp.position.x = random(0, width);
      sp.position.y = random(-height, 0);
      sp.mySpeedY = random(5, 50);
      raineGroup.add(sp);
    }
  } else {
    for (let i = 0; i < raineNum; i++) {
      const sp = createSprite();
      sp.addImage(random(raineimages));
      sp.position.x = random(0, width);
      sp.position.y = random(-height, 0);
      sp.mySpeedY = random(5, 20);
      sp.mySpeedX = sp.mySpeedY;
      raineGroup.add(sp);
    }
  }

  coile_elec_sp = createSprite(470, 30); //表示する場所、スプライトを作製する
  coile_elec_sp.addAnimation('idle', coile_elecAnim); //スプライトにアニメーションを追加する
  coile_elec_sp.visible = false; //隠してる
  coile_elec_sp.animation.looping = false; //ループさせない
  coile_elec_sp.animation.stop(); //アニメーションを止めておく

  coile_elec_sp2 = createSprite(470, 30);
  coile_elec_sp2.addAnimation('idle', coile_elecAnim);
  coile_elec_sp2.visible = false;
  coile_elec_sp2.animation.looping = false;
  coile_elec_sp2.animation.stop();
  coile_elec_sp2.mirrorX(-1) //反転させる


  on_elec_sp = createSprite(75, 860);
  on_elec_sp.addAnimation('start', on_elec_1);
  on_elec_sp.addAnimation('on', on_elecAnim);
  on_elec_sp.animation.looping = false;
  on_elec_sp.visible = false;
  on_elec_sp.scale = 5;
  on_elec_sp.debug = true;
  on_elec_sp.setCollider('rectangle', 0, -7, 60, 50); //四角い当たり判定を設定するデフォルトだと大きすぎるのでここに設定した

  haguruma_sp = createSprite(1900, 30);
  haguruma_sp.addImage(haguruma);
  haguruma_sp.rotationSpeed = 3;
  haguruma_sp.scale = 1;
  haguruma_sp.debug = true;
  haguruma_sp.setCollider('rectangle', 0, -7, 500, 500);

  pip_elec_sp = createSprite(350, 270);
  pip_elec_sp.addAnimation('out', pip_elecAnim);
  pip_elec_sp.animation.looping = true;
  pip_elec_sp.visible = false;
  pip_elec_sp.debug = true;
  pip_elec_sp.scale = 5;
  pip_elec_sp.mirrorX(-1);
  pip_elec_sp.setCollider('rectangle', 0, -37, 100, 35);

}

function draw() {
  currentTime = millis();
  push();
  drawSprites();
  pop();
}

function setSpriteProperty(sp, xpos, ypos) {
  sp.position.x = xpos;
  sp.position.y = ypos;
}

function setNewRandomTarget(sp) {
  sp.targetX = random(0, width);
  sp.targetY = random(0, height);
}

function first(right_handX, right_handY, left_handX, left_handY) {
  pip_elec_sp.visible = false;
  haguruma_sp.visible = false;
  on_elec_sp.visible = false;
  raineGroup.visible = false;
  caeru_sp.visible = false;
  leaf_um_sp = false;
  //reep_sp.visible = true;
  for (let i = 0; i < leafgroup.leng; i++) {
    leafgroup[i].visible = false;
  }
  for (let i = 0; i < reeps.length; i++) {
    const reep_sp = reeps[i];
    const distance_reep = dist(right_handX, right_handY, reep_sp.position.x, reep_sp.position.y); //マウスと指定したスプライトとの距離を測る
    // マウスがスプライトに触れたかどうかをチェック


    const distance = dist(reeps[i].position.x, reeps[i].position.y, reep_sp.targetX, reep_sp.targetY);

    if (distance < reep_sp.maxSpeed * 2) {
      setNewRandomTarget(reep_sp);
    }

    reep_sp.attractionPoint(0.2, reep_sp.targetX, reep_sp.targetY);

    if (reep_sp.targetX < reep_sp.position.x) {
      reeps[i].mirrorX(-1);
    } else {
      reep_sp.mirrorX(1);
    }
    const distance_reeps = dist(left_handX, left_handY, reep_sp.position.x, reep_sp.position.y); //マウスと指定したスプライトとの距離を測る

    reep_sp.position.x = constrain(reep_sp.position.x, 0, width);
    reep_sp.position.y = constrain(reep_sp.position.y, 0, height);
    if (distance_reep < 100) {


      console.log(i)
      reep_sp.changeAnimation('die'); // もし現在のアニメーションが'die'でなければ変更
      reep_sp.setSpeed(0); // 動きを止める
      setTimeout(() => {
        reep_sp.visible = false;
        console.log(reep_sp.visible);
      }, 1250);

    }

    if (!reep_sp.visible) {
      if (currentTime % 37 == 0) {
        reep_sp.visible = true;
        reep_sp.changeAnimation('vanish');
        console.log("die");
        setTimeout(() => {
          reep_sp.changeAnimation('run');
        }, 1250);
      }
    }

    //}
  }
}


function rainy(right_handX, right_handY, index) {
  pip_elec_sp.visible = false;
  haguruma_sp.visible = false;
  on_elec_sp.visible = false;
  leaf_um_sp.visible = true;
  raineGroup.visible = true;
  caeru_sp.visible = true;
  reeps.visible = false;
  scale(3.0);
  for (let i = 0; i < reeps.length; i++) {
    const reep_sp = reeps[i];
    reep_sp.visible = false;
  }
  leafgroup[index].visible = true;
  leafgroup[index].position.x = right_handX;
  leafgroup[index].position.y = right_handY;


  caeru_sp.position.x = 150;
  caeru_sp.position.y = 300;

  if (q == 1) {
    updateRain();
  } else {
    updaterain();
  }
  if (leafgroup[index].getAnimationLabel() == 'grow' && leafgroup[index].animation.ended) {
    leaf_um_sp.changeAnimation('one');
  }
  //アニメーション終了時に当たり判定をオンにしたい
  //if(leaf_um_sp.animation.ended){
  leafgroup[index].overlap(raineGroup, removeRaindrop);
  //}
  if (Math.floor(random(1000)) == 0) {
    leafgroup[index].changeAnimation('grow');
    leafgroup[index].animation.goToFrame(leafgroup[index].animation.getLastFrame());

  }
  if (index == 0) {
    for (let i = 0; i < 50; i++) {
      leafgroup[i].visible = false;
    }
  }
}

function updateRain() {
  for (let raineSp of raineGroup) {
    raineSp.position.y += raineSp.mySpeedY;

    const offScreenBottom = raineSp.position.y > height + raineSp.height / 2;

    if (offScreenBottom) {
      raineSp.position.y = random(-raineSp.height * 2, -raineSp.height / 2);
      raineSp.position.x = random(0, width);
      raineSp.mySpeedY = random(5, 20);
    }
  }
}

function updaterain() {
  for (let raineSp of raineGroup) {
    raineSp.position.y += raineSp.mySpeedY;
    raineSp.position.x += raineSp.mySpeedX;

    const offScreenBottom = raineSp.position.y > height + raineSp.height / 2;
    const offScreenLeft = raineSp.position.x < -raineSp.width / 2;
    const offScreenRight = raineSp.position.x > width + raineSp.width / 2;

    if (offScreenBottom || offScreenLeft || offScreenRight) {
      raineSp.position.y = random(-raineSp.height * 2, -raineSp.height / 2);
      raineSp.position.x = random(0, width);
      raineSp.mySpeedX = random(-40, -20);
      raineSp.mySpeedY = random(5, 20);
    }
  }
}

function removeRaindrop(umbrella, raindrop) {
  const raine_jpSp = createSprite(raindrop.position.x, raindrop.position.y);
  raine_jpSp.addAnimation('jmpe', raine_jpAnim);
  raine_jpSp.scale = 0.5;
  raine_jpGroup.add(raine_jpSp);

  raindrop.position.y = random(-raindrop.height, 0);
  raindrop.position.x = random(0, width);
  raindrop.mySpeedY = (q == 1) ? random(5, 50) : random(5, 20);
  raindrop.mySpeedX = (q == 1) ? 0 : random(-40, -20);

  /*    
  raindrop.remove();
   isUmbrellaHit = true;
   setTimeout(() => {
       isUmbrellaHit = false; 
   }, 100);
   */
}

function elecy(right_handX, right_handY, left_handX, left_handY, index) {
  pip_elec_sp.visible = true;
  haguruma_sp.visible = true;
  on_elec_sp.visible = true;
  //leaf_um_sp.visible = false;
  raineGroup.visible = false;
  caeru_sp.visible = false;
  //reeps.visible = false;
  scale(3.0);
  console.log("--###################---");
  console.log(index);
  for (let i = 0; i < reeps.length; i++) {
    const reep_sp = reeps[i];
    reep_sp.visible = false;
  }
  for (let i = 0; i < leafgroup.length; i++) {
    const reep_sp = leafgroup[i];
    reep_sp.visible = false;
  }
  rightgroup[index].position.x = right_handX;
  rightgroup[index].position.y = right_handY;
  rightgroup[index].visible = true;
  if (index == 0) {
    for (let i = 0; i < 50; i++) {
      flowergroup[i].visible = false;
    }
  }


  right_elec_sp.position.x = right_handX; //マウスにライトを追従させる
  right_elec_sp.position.y = right_handY;

  const distance_on = dist(left_handX, left_handY, on_elec_sp.position.x, on_elec_sp.position.y + 550); //マウスと指定したスプライトとの距離を測る

  if (distance_on < proximityDistance) { //近づいたときのif
    on_elec_sp.changeAnimation('on'); //一定以上に近づいたらアニメーションを変える
  } else {
    on_elec_sp.changeAnimation('start'); //近づていないならそのまんま
  }

  const distance_hg = dist(right_handX, right_handY, haguruma_sp.position.x + 1300, haguruma_sp.position.y + 90);
  const distance_pip = dist(right_handX, right_handY, pip_elec_sp.position.x, pip_elec_sp.position.y);


  if (distance_hg < proximityDistance) { //歯車との距離
    // console.log("kakakakkakakakkakakakakkakak");
    right_elec_sp.position.x = right_handX; //近づいたら電球のアニメーションをマウスの座標に表示
    right_elec_sp.position.y = right_handY;
    right_elec_sp.changeAnimation('idle')
    right_elec_sp.visible = true;
    right_elec_sp.animation.looping = true;
    right_elec_sp.animation.play();
    // console.log("wowiwiwiwiwiwiwiwiwiwiwiwi");

  } else if (distance_pip < proximityDistance) { //パイプとの距離
    // console.log("---------------------------");
    right_elec_sp.position.x = right_handX;
    right_elec_sp.position.y = right_handY;
    right_elec_sp.visible = true;
    right_elec_sp.changeAnimation('idle')
    right_elec_sp.animation.looping = true;
    right_elec_sp.animation.play();
    // console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
  } else { //それ以外は表示させない
    right_elec_sp.visible = false;
    right_elec_sp.animation.stop();
  }




  if (right_handX == lef_hnx && right_handY == left_handY) { //マウスのx,yが一緒なら電球とコイルを表示させる＊＊ここを右手と左手に変換＊＊
    coile_elec_sp.position.x = right_handX;
    coile_elec_sp.position.y = right_handY;
    coile_elec_sp.visible = true;
    coile_elec_sp.animation.play(); //アニメーションを動かす

    coile_elec_sp2.position.x = coile_elec_sp.position.x + 35;
    coile_elec_sp2.position.y = coile_elec_sp.position.y;
    coile_elec_sp2.visible = true;
    coile_elec_sp2.animation.play();
    //right_elec_sp.visible = false;
    //coile_elec_sp.visible = false;

    right_elec_sp.position.x = right_handX + 18;
    right_elec_sp.position.y = right_handY - 20;

    if (currentTime > time) { //未実装これはオンが作動してから六十秒間のうちは電球が光るというもの


      right_elec_sp.visible = true;
      right_elec_sp.animation.looping = true;
      right_elec_sp.animation.play();
    }
  } else { //それ以外の時は隠す
    if (coile_elec_sp.visible) {
      coile_elec_sp.animation.rewind();
      coile_elec_sp.animation.stop();
      coile_elec_sp.visible = false;
    }
    if (coile_elec_sp2.visible) {
      coile_elec_sp2.animation.rewind();
      coile_elec_sp2.animation.stop();
      coile_elec_sp2.visible = false;
    }
    /*
                    if (right_elec_sp.visible) {
                        right_elec_sp.animation.stop();
                        right_elec_sp.visible = false;
                    }*/
  }


}


function Flower(x, y, index) {
  flowergroup[index].position.x = x;
  flowergroup[index].position.y = y + 15;
  flowergroup[index].visible = true;
  if (index == 0) {
    for (let i = 0; i < 50; i++) {
      flowergroup[i].visible = false;
    }
  }

}

function setProprty(sp, xpos, ypos) { //当たり判定をひょじするための関数
  sp.position.x = xpos;
  sp.position.y = ypos;
  sp.debug = true;
}
// WebSocketの接続
const showCamera = true; // 初期値を設定
function connectWebSocket(canvas) {
  let socket = io("http://100.108.145.71:5000");
  socket.on('connect', function () {
    console.log('WebSocket connected');
    resetConnectionTimeout();

    // 接続時にカメラ表示設定を送信
    socket.emit('camera_setting', {
      showCamera: showCamera
    });
  });

  socket.on('pose_data', function (data) {
    updateVisualization(data,canvas);
    resetConnectionTimeout();
  });

  socket.on('disconnect', function () {
    console.log('WebSocket disconnected');
  });

  socket.on('connect_error', function (error) {
    console.error('WebSocket connection error:', error);
  });

  // データ受信がなければ5秒後にエラー表示
  resetConnectionTimeout();
}

function updateVisualization(data,canvas) {
  const ctx = canvas.getContext('2d');
  // システムが停止している場合の処理
  if (!data.detection_running) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景を暗いグレーに設定
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 「システム停止中」メッセージを表示
    ctx.fillStyle = '#dc3545';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('システム停止中', canvas.width / 2, canvas.height / 2 - 30);

    // サブメッセージを表示
    ctx.fillStyle = '#6c757d';
    ctx.font = '24px Arial';
    ctx.fillText('検出処理が実行されていません', canvas.width / 2, canvas.height / 2 + 30);
    return;
  }

  // カメラフレームがある場合でも、表示設定に従って処理
  if (data.frame && showCamera) {
    const img = new Image();
    img.onload = function () {
      // キャンバスサイズ調整（必要な場合のみ）
      if (canvas.width !== img.width || canvas.height !== img.height) {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // 高速描画設定
      // ctx.imageSmoothingEnabled = false;  // アンチエイリアス無効で高速化

      // 直接メインキャンバスに描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // その上にポーズデータを描画
      drawPoseDataToContext(ctx, data);
    };
    img.src = data.frame;
  } else {
    // カメラフレームがない場合、または表示しない設定の場合
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.poses.length === 0) {
      // 人がいない場合は薄いグレーの背景
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // メッセージを表示
      ctx.fillStyle = '#6c757d';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      let message = showCamera ? 'カメラが接続されていません' : '人物が検出されていません';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
      return;
    }

    drawPoseDataToContext(ctx, data);
  }
}

function drawPoseDataToContext(targetCtx, data) {
  // 各人物の姿勢を描画
  data.poses.forEach((person, index) => {
    let pnumber = index;
    // キーポイントを描画
    person.keypoints.forEach((kp, keypointIndex) => {
      if (kp.visible) {
        // 通常のキーポイント描画
        targetCtx.beginPath();
        targetCtx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        targetCtx.fillStyle = '#00ff00';
        targetCtx.fill();
        // ラベル表示が有効な場合のみキーポイントにラベルを表示
        const showLabels = true; // ラベル表示の設定
        if (showLabels) {
          targetCtx.font = '16px Arial';
          targetCtx.textAlign = 'center';
          targetCtx.textBaseline = 'middle';
          if (keypointIndex == 5) {
            lef_shx = kp.x;
            lef_shy = kp.y;

          } else if (keypointIndex == 6) {
            rgh_shx = kp.x;
            rgh_shy = kp.y;

          } else if (keypointIndex == 9) {
            lef_hnx = kp.x;
            lef_hny = kp.y;
          } else if (keypointIndex == 10) {
            rgh_hnx = kp.x;
            rgh_hny = kp.y;
          } else if (keypointIndex == 0) {
            nosex = kp.x;
            nosey = kp.y;
          }
          max_x = Math.max(rgh_shx, lef_shx);
          min_x = Math.min(rgh_shx, lef_shx);
          max_y = Math.max(rgh_shy, lef_shy);
          min_y = Math.min(rgh_shy, lef_shy);

          mune_x = (max_x - min_x) / 2;
          mune_y = (max_y - min_y) / 2;

          if (m == 1) {
            first(rgh_hnx, rgh_hny, lef_hnx, lef_hny); //動き回って消えるやつ
          } else if (m == 2) {
            rainy(rgh_hnx, rgh_hny, index + 1) //傘さすやつ、胸追加する
          } else {
            elecy(rgh_hnx, rgh_hny, lef_hnx, lef_hny, index + 1); //電気のやつ
          }
          Flower(nosex, nosey, pnumber + 1);
        }
      }
    });

  });
}

function resetConnectionTimeout() {
  let connectionTimeout = null;
  if (connectionTimeout) clearTimeout(connectionTimeout);
  connectionTimeout = setTimeout(function () {
    // console.log("接続'status-badge stopped");
  }, 5000);
}