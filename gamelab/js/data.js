// =============================================
// MBTI Battle Game — Data Definitions
// =============================================

// ----- MBTI Types Data -----
const MBTI_DATA = {
  INTJ: {
    name: "建築家",
    description: "孤高の戦略家。長期ビジョンを描き黙々と実行する完璧主義者",
    group: "NT", color: "#8B5CF6", bgColor: "#2D1B69",
    stats: { hp: 110, attack: 30, defense: 14 },
    special: { name: "長期戦略", description: "敵全体に攻撃力×0.7のダメージ", type: "all_attack", power: 0.7 },
    compatibility: {
      best:    { type: "ENTP", reason: "直観同士が惹かれ合い知的刺激が高い" },
      good:    { type: "INFJ", reason: "ビジョンと価値観が一致する" },
      caution: { type: "ISFP", reason: "感性の違いで摩擦が生じやすい" },
      worst:   { type: "ESFP", reason: "4軸全て正反対で話が噛み合わない" }
    }
  },
  INTP: {
    name: "論理学者",
    description: "効率重視の知的探究者。理論と分析に没頭するIQ高めのオタク気質",
    group: "NT", color: "#7C3AED", bgColor: "#1E1045",
    stats: { hp: 95, attack: 28, defense: 10 },
    special: { name: "弱点解析", description: "次の攻撃のダメージが2倍になる", type: "self_buff_double", power: 2.0 },
    compatibility: {
      best:    { type: "ENTJ", reason: "互いの論理・行動力が高め合う" },
      good:    { type: "ENFJ", reason: "自分の知識を引き出してくれる" },
      caution: { type: "ISFJ", reason: "感情優先の相手にペースを崩される" },
      worst:   { type: "ESFJ", reason: "4軸全て正反対で価値観が合わない" }
    }
  },
  ENTJ: {
    name: "指揮官",
    description: "主導権を握るカリスマリーダー。目標への推進力と統率力が抜群",
    group: "NT", color: "#6D28D9", bgColor: "#1A0A3D",
    stats: { hp: 115, attack: 32, defense: 12 },
    special: { name: "号令", description: "味方全体の攻撃力を次ターン1.5倍にする", type: "party_attack_buff", power: 1.5 },
    compatibility: {
      best:    { type: "INTP", reason: "論理的補完で最強タッグになれる" },
      good:    { type: "INFP", reason: "感情面を補い合い互いが成長する" },
      caution: { type: "INTJ", reason: "第三者がいると主導権争いになる" },
      worst:   { type: "ISFP", reason: "行動原理が正反対で理解しにくい" }
    }
  },
  ENTP: {
    name: "討論者",
    description: "ドSな論争好き！陽気サイコパス！好奇心と反骨心で議論を楽しむ",
    group: "NT", color: "#5B21B6", bgColor: "#160835",
    stats: { hp: 100, attack: 26, defense: 11 },
    special: { name: "論破", description: "敵一体の防御を2ターン半減させる", type: "enemy_def_down", power: 0.5 },
    compatibility: {
      best:    { type: "INTJ", reason: "互いのビジョンと論理が深く共鳴する" },
      good:    { type: "ISFP", reason: "感性と論理が尊重し合える関係" },
      caution: { type: "INTP", reason: "第三者がいると論争に発展しやすい" },
      worst:   { type: "ISFJ", reason: "真逆の優先順位でぶつかりやすい" }
    }
  },
  INFJ: {
    name: "提唱者",
    description: "希少な理想主義者。深い洞察と共感力で人の心に寄り添うメンター",
    group: "NF", color: "#059669", bgColor: "#052E1A",
    stats: { hp: 100, attack: 20, defense: 13 },
    special: { name: "洞察の光", description: "味方全体のHPを25回復する", type: "party_heal", power: 25 },
    compatibility: {
      best:    { type: "ENFP", reason: "直観とFで魂レベルで惹かれ合う" },
      good:    { type: "INTJ", reason: "ビジョン・静けさが波長一致" },
      caution: { type: "ISFP", reason: "感情共有できるが行動ペースが違う" },
      worst:   { type: "ESTP", reason: "今この瞬間vs未来志向で根本的にずれる" }
    }
  },
  INFP: {
    name: "仲介者",
    description: "理想と共感を大切にするロマンチスト。独自の価値観を持つ夢想家",
    group: "NF", color: "#10B981", bgColor: "#083327",
    stats: { hp: 95, attack: 22, defense: 10 },
    special: { name: "感情の波", description: "ランダムな威力（50〜200%）の大攻撃！", type: "random_power", power: [0.5, 2.0] },
    compatibility: {
      best:    { type: "ENFJ", reason: "ENFJが優しくINFPを引き出してくれる" },
      good:    { type: "ESTP", reason: "幅広い興味と感性を共有できる" },
      caution: { type: "ISFJ", reason: "似ているが感情表現の温度差がある" },
      worst:   { type: "ESTJ", reason: "ルール重視vs自由な価値観で衝突必至" }
    }
  },
  ENFJ: {
    name: "主人公",
    description: "天性の指導者。情熱とカリスマで周りを鼓舞するエンパス型リーダー",
    group: "NF", color: "#34D399", bgColor: "#0A3D2A",
    stats: { hp: 108, attack: 22, defense: 12 },
    special: { name: "カリスマ鼓舞", description: "味方全体のHPを15回復し、攻撃力を1.3倍にする", type: "party_heal_and_buff", power: 15 },
    compatibility: {
      best:    { type: "INFP", reason: "INFPの内面をENFJが引き出す理想の関係" },
      good:    { type: "ISTJ", reason: "調和と規律の共通点で安定した絆" },
      caution: { type: "INFJ", reason: "内向外向のテンポの違いで疲れやすい" },
      worst:   { type: "ISTP", reason: "感情vs論理で真逆の判断になりやすい" }
    }
  },
  ENFP: {
    name: "運動家",
    description: "自由奔放な情熱家。好奇心と共感力で世界を広げるムードメーカー",
    group: "NF", color: "#6EE7B7", bgColor: "#0D4435",
    stats: { hp: 102, attack: 25, defense: 9 },
    special: { name: "情熱爆発", description: "ランダムな敵に攻撃力×2.5の超攻撃！", type: "random_target_big", power: 2.5 },
    compatibility: {
      best:    { type: "INFJ", reason: "深い共感と直観で魂が共鳴する最強ペア" },
      good:    { type: "ISFP", reason: "お互いの感性と自由さが心地よい" },
      caution: { type: "ISTJ", reason: "自由vs規律で価値観が真正面から衝突" },
      worst:   { type: "INTJ", reason: "自由奔放さと完璧主義で正反対" }
    }
  },
  ISTJ: {
    name: "ロジスティシャン",
    description: "几帳面で責任感の塊。ルールと事実を大切にする信頼の番人",
    group: "SJ", color: "#F59E0B", bgColor: "#451A03",
    stats: { hp: 120, attack: 22, defense: 18 },
    special: { name: "鉄壁守備", description: "次のターン、パーティー全体が受けるダメージをゼロにする", type: "party_shield", power: 1 },
    compatibility: {
      best:    { type: "ESTP", reason: "行動力と安定感が見事に噛み合う" },
      good:    { type: "ESFP", reason: "賑やかさとルールで補い合える" },
      caution: { type: "INFJ", reason: "価値観の根っこが違いすれ違いやすい" },
      worst:   { type: "ENFP", reason: "計画性vs自由さで生活リズムが合わない" }
    }
  },
  ISFJ: {
    name: "擁護者",
    description: "献身的な守護者。陰ながら人を支え続ける思いやりの塊",
    group: "SJ", color: "#FBBF24", bgColor: "#4B2800",
    stats: { hp: 112, attack: 18, defense: 16 },
    special: { name: "守護の盾", description: "味方全体の防御を次のターン2倍にする", type: "party_def_buff", power: 2.0 },
    compatibility: {
      best:    { type: "ESTP", reason: "ISFJの安心感とESTPの刺激が絶妙なバランス" },
      good:    { type: "ESFP", reason: "誠実さと明るさが自然に補い合う" },
      caution: { type: "INFP", reason: "共感はできるが行動の方向性がずれやすい" },
      worst:   { type: "ENTP", reason: "好奇心vs安定志向で考え方が根本的に違う" }
    }
  },
  ESTJ: {
    name: "幹部",
    description: "統率と秩序のプロ。ルールを守り組織をまとめる頼れる幹部",
    group: "SJ", color: "#D97706", bgColor: "#3D1500",
    stats: { hp: 118, attack: 26, defense: 16 },
    special: { name: "統率命令", description: "敵全体に攻撃力×0.6のダメージを与える", type: "all_attack", power: 0.6 },
    compatibility: {
      best:    { type: "ISTP", reason: "実務的な強さ同士が最強のビジネスペア" },
      good:    { type: "ISFP", reason: "ESTJの統率とISFPの柔軟さが補完する" },
      caution: { type: "INFJ", reason: "理想論vs現実思考でかみ合わない" },
      worst:   { type: "INFP", reason: "感性と論理が真正面からぶつかる" }
    }
  },
  ESFJ: {
    name: "領事",
    description: "社交的な世話焼き。周囲の調和を大切にする温かいコミュニティの核",
    group: "SJ", color: "#B45309", bgColor: "#2D1000",
    stats: { hp: 108, attack: 20, defense: 14 },
    special: { name: "愛の癒し", description: "一番HPが少ない味方を40回復する", type: "single_heal_max", power: 40 },
    compatibility: {
      best:    { type: "ISFP", reason: "温かさと美的感性でお互いが癒される" },
      good:    { type: "ISTP", reason: "ESFJの安定感とISFPの芸術性が補完する" },
      caution: { type: "INTJ", reason: "感情重視vs論理重視でペースが合わない" },
      worst:   { type: "INTP", reason: "現実的な繋がりを求める相手に論理が空回り" }
    }
  },
  ISTP: {
    name: "巨匠",
    description: "無口な天才職人。ツールと技術で問題を解決するクールな実用主義者",
    group: "SP", color: "#EF4444", bgColor: "#3D0808",
    stats: { hp: 105, attack: 29, defense: 13 },
    special: { name: "急所打ち", description: "高確率でクリティカル！攻撃力×1.8のダメージ", type: "critical_attack", power: 1.8 },
    compatibility: {
      best:    { type: "ESTJ", reason: "ISTPの分析力とESTJの実行力が最強タッグ" },
      good:    { type: "ESFJ", reason: "感覚と実務で互いの弱点を補える" },
      caution: { type: "ENFJ", reason: "感情表現の濃さにISTPが引いてしまう" },
      worst:   { type: "ENFP", reason: "論理vs感情の優先度が正反対で疲弊" }
    }
  },
  ISFP: {
    name: "冒険家",
    description: "感性豊かなアーティスト。今この瞬間の美しさを大切にする穏やかな探検家",
    group: "SP", color: "#F87171", bgColor: "#4A0A0A",
    stats: { hp: 98, attack: 24, defense: 11 },
    special: { name: "瞬閃", description: "素早く敵全体に攻撃力×0.5のダメージ！", type: "all_attack", power: 0.5 },
    compatibility: {
      best:    { type: "ENFJ", reason: "ENFJが優しくISFPを照らしてくれる" },
      good:    { type: "ESTJ", reason: "感覚的な美しさとESTJの実行力が補完する" },
      caution: { type: "ENTP", reason: "議論好きな相手に振り回されやすい" },
      worst:   { type: "ENTJ", reason: "指示されることに強いストレスを感じる" }
    }
  },
  ESTP: {
    name: "起業家",
    description: "大胆不敵なアドレナリン中毒。現場型のエネルギッシュなトラブルシューター",
    group: "SP", color: "#DC2626", bgColor: "#420606",
    stats: { hp: 105, attack: 28, defense: 10 },
    special: { name: "大博打", description: "50%の確率で3倍ダメージ、50%でミス！", type: "gamble_attack", power: 3.0 },
    compatibility: {
      best:    { type: "ISFJ", reason: "ISFJの安定感がESTPを陰で支える最強の絆" },
      good:    { type: "ISTJ", reason: "行動力と計画性がかみ合う実務的な相性" },
      caution: { type: "INFP", reason: "感情の深さについていけないことがある" },
      worst:   { type: "INFJ", reason: "直観的な深さと刹那的な行動が根本からずれる" }
    }
  },
  ESFP: {
    name: "エンターテイナー",
    description: "場を盛り上げる天性のパーティーピーポー。今を全力で楽しむポジティブの塊",
    group: "SP", color: "#B91C1C", bgColor: "#380404",
    stats: { hp: 100, attack: 22, defense: 11 },
    special: { name: "ノリノリ！", description: "味方全体のHPを20回復し、ランダムなバフを与える！", type: "party_heal_random_buff", power: 20 },
    compatibility: {
      best:    { type: "ISTJ", reason: "ISTJの安定がESFPを支えるベストバランス" },
      good:    { type: "ISFJ", reason: "誠実さと明るさが自然に引き合う" },
      caution: { type: "ENFP", reason: "似ているようで刺激の方向性が違う" },
      worst:   { type: "INTJ", reason: "自由な今vsビジョン重視の未来で根本がずれる" }
    }
  }
};

const MBTI_GROUPS = {
  NT: { label: "アナリスト",      color: "#8B5CF6", members: ["INTJ","INTP","ENTJ","ENTP"] },
  NF: { label: "ディプロマット",  color: "#10B981", members: ["INFJ","INFP","ENFJ","ENFP"] },
  SJ: { label: "センチネル",      color: "#F59E0B", members: ["ISTJ","ISFJ","ESTJ","ESFJ"] },
  SP: { label: "エクスプローラー",color: "#EF4444", members: ["ISTP","ISFP","ESTP","ESFP"] }
};

const MBTI_LIST = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];

// ----- Enemy Data -----
const ENEMY_DATA = [
  { id:"slime",       name:"スライム",   description:"ぷよぷよした謎の生き物", round:1, count:2, hp:70,  attack:13, defense:3,  color:"#48BB78", image:"images/enemies/enemy1.png", specials:[] },
  { id:"goblin",      name:"ゴブリン",   description:"小賢しい山の悪戯者",     round:2, count:2, hp:95,  attack:19, defense:6,  color:"#68D391", image:"images/enemies/enemy2.png", specials:[{ name:"集団攻撃", damage:1.5, description:"2体で協力して攻撃！" }] },
  { id:"orc",         name:"オーク",     description:"筋肉自慢の大型モンスター",round:3, count:1, hp:150, attack:28, defense:10, color:"#9AE6B4", image:"images/enemies/enemy3.png", specials:[{ name:"岩砕き",   damage:2.0, description:"強烈な一撃！" }] },
  { id:"dark_knight", name:"闇の騎士",  description:"闇の力を纏った恐るべき戦士",round:4, count:1, hp:190, attack:35, defense:14, color:"#63B3ED", image:"images/enemies/enemy4.png", specials:[{ name:"闇の剣", damage:2.2, description:"必殺の一撃！" }, { name:"魂の吸収", damage:1.5, lifesteal:0.5, description:"ダメージの50%を回復！" }] }
];

const BOSS_DATA = {
  id:"maou", name:"大魔王", description:"全ての悪の根源。圧倒的な力でパーティーに立ちはだかる！",
  hp:350, attack:42, defense:16, color:"#FC8181", image:"images/enemies/boss.png",
  specials:[
    { name:"魔王の咆哮", damage:1.8, description:"全体に大ダメージ！", allTarget:true },
    { name:"黒き炎",     damage:2.5, description:"一人に超強力な一撃！" },
    { name:"混沌の波",   damage:1.2, description:"全体にダメージ＋デバフ！", allTarget:true, debuff:true }
  ]
};

// =============================================
// BATTLE COMPATIBILITY EVENTS
// バトル中にMBTIの相性で発生するイベント
// =============================================
const BATTLE_COMPAT_EVENTS = {
  worst: [
    {
      title: "💥 大喧嘩！友軍誤射！",
      getDesc: (a, b) => `${a}と${b}の口論が激化！怒りに我を忘れた${a}が、味方の${b}に攻撃してしまった！`,
      effectSummary: (a, b) => `${a}の攻撃が${b}にヒット！`,
      key: "friendly_fire"
    },
    {
      title: "💥 喧嘩で行動不能！",
      getDesc: (a, b) => `${a}と${b}が激しく言い争いを始め、二人とも次の行動ができなくなってしまった！`,
      effectSummary: (a, b) => `${a}と${b}が次ターン行動不能！`,
      key: "both_stun"
    },
    {
      title: "💥 怒りで集中力ゼロ！",
      getDesc: (a, b) => `${a}は${b}への怒りで完全に集中力を失い、敵の攻撃をモロに食らってしまった！`,
      effectSummary: (a, b) => `${a}が敵の追加攻撃を受けた！`,
      key: "enemy_extra_hit"
    },
    {
      title: "💥 意見衝突でチーム崩壊！",
      getDesc: (a, b) => `${a}と${b}の対立がチーム全体に悪影響！パーティー全員の攻撃力が大幅低下！`,
      effectSummary: (a, b) => `全員の攻撃力が低下！`,
      key: "party_atk_down"
    }
  ],
  caution: [
    {
      title: "⚡ ペースが合わない",
      getDesc: (a, b) => `${a}と${b}の呼吸が合わず動きがぎこちなくなった。二人の攻撃力が落ちてしまった。`,
      effectSummary: (a, b) => `${a}と${b}の攻撃力が低下`,
      key: "ab_atk_down"
    },
    {
      title: "⚡ ギクシャクした空気が伝染",
      getDesc: (a, b) => `${a}と${b}の微妙な空気がチームに広がり、全員が少し消耗してしまった。`,
      effectSummary: (a, b) => `全員が少しダメージを受けた`,
      key: "party_drain"
    }
  ],
  good: [
    {
      title: "💫 励まし！",
      getDesc: (a, b) => `${a}が${b}を優しく励ました！「大丈夫、一緒に戦おう！」${b}のHPが回復した！`,
      effectSummary: (a, b) => `${b}のHPが20回復！`,
      key: "heal_b"
    },
    {
      title: "💫 防御サポート",
      getDesc: (a, b) => `${a}と${b}がお互いの背中を守り合った！二人の防御力がアップ！`,
      effectSummary: (a, b) => `${a}と${b}の防御力がアップ！`,
      key: "ab_def_buff"
    },
    {
      title: "💫 触発！士気アップ",
      getDesc: (a, b) => `${a}の活躍に${b}が触発された！「俺もやってやる！」${b}の攻撃力が上がった！`,
      effectSummary: (a, b) => `${b}の攻撃力がアップ！`,
      key: "b_atk_buff"
    }
  ],
  best: [
    {
      title: "✨ 連携攻撃！",
      getDesc: (a, b) => `${a}と${b}の阿吽の連携が炸裂！二人が息ぴったりで敵を同時攻撃した！`,
      effectSummary: (a, b) => `${a}と${b}が連携攻撃！`,
      key: "combo_attack"
    },
    {
      title: "✨ 庇い合い！",
      getDesc: (a, b) => `${b}が${a}の前に飛び出した！「俺が守る！」次の敵の攻撃を${b}が身代わりになる！`,
      effectSummary: (a, b) => `${b}が${a}を守る！`,
      key: "b_covers_a"
    },
    {
      title: "✨ シナジー爆発！",
      getDesc: (a, b) => `${a}と${b}のシナジーが爆発！最強コンビがパーティー全員の戦闘力を引き上げた！`,
      effectSummary: (a, b) => `全員の攻撃力が大幅アップ！`,
      key: "party_atk_buff"
    },
    {
      title: "✨ インスピレーション！",
      getDesc: (a, b) => `${a}の姿に${b}がインスピレーションを受けた！${b}が追加で特技を発動する！`,
      effectSummary: (a, b) => `${b}が追加特技発動！`,
      key: "b_extra_special"
    }
  ]
};

// =============================================
// ROAD EVENT TEMPLATES — PAIR BASED
// パーティーの相性ペアによって生成される道中イベント
// =============================================
const ROAD_EVENT_PAIR_TEMPLATES = {
  worst: [
    {
      title: "💥 仲間割れの夜",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})の口論が夜通し続いた。怒声が谷間に響き渡り、誰も眠れなかった。翌朝、全員が睡眠不足でぐったりしていた...`,
      effectText: "全員のHPが15減少。次のバトルの攻撃力も低下！",
      effect: { type: "quarrel_night", damage: 15, atkDebuff: 0.8 }
    },
    {
      title: "💥 食事中の大衝突",
      getDesc: (a, b) => `夕食の準備中に${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})が激突。怒鳴り合いの末、鍋をひっくり返し、食事は台無しに。空腹のまま就寝した全員は翌日ぐったりだった。`,
      effectText: "全員のHPが20減少！食べ損ねてしまった...",
      effect: { type: "damage_all", amount: 20 }
    },
    {
      title: "💥 進路を巡る口論",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})が進路を巡って激しく口論になり、気づけば道を大きく外れていた。体力を消耗しながらやっと戻ってきた。`,
      effectText: "全員のHPが12減少。余計な体力を使ってしまった。",
      effect: { type: "damage_all", amount: 12 }
    }
  ],
  best: [
    {
      title: "✨ 最高のキャンプ",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})の会話が大いに盛り上がり、焚き火を囲んだ最高の夜になった。笑い声がパーティー全体を元気にした！`,
      effectText: "全員のHPが25回復！次のバトルの攻撃力もアップ！",
      effect: { type: "heal_and_atk_buff", heal: 25, atkBuff: 1.2 }
    },
    {
      title: "✨ 息ぴったりの連携",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})が料理・見張り・地図確認を完璧に分担した。翌朝は全員万全の体調で出発できた！`,
      effectText: "全員のHPを30回復！次バトルの防御力もアップ！",
      effect: { type: "heal_and_def_buff", heal: 30, defBuff: 1.2 }
    }
  ],
  good: [
    {
      title: "💫 楽しい道中",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})は道中ずっと楽しく話し合い、良い雰囲気でキャンプに到着。パーティー全体に温かな空気が流れた。`,
      effectText: "全員のHPが15回復。",
      effect: { type: "heal_all", amount: 15 }
    },
    {
      title: "💫 互いを高め合う",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})が互いの長所を認め合い、作戦の話で盛り上がった。次のバトルに向けてやる気が湧いてきた！`,
      effectText: "次のバトルで全員の攻撃力がアップ！",
      effect: { type: "atk_buff_all", amount: 1.15 }
    }
  ],
  caution: [
    {
      title: "⚡ ギクシャクした道中",
      getDesc: (a, b) => `${a}(${MBTI_DATA[a].name})と${b}(${MBTI_DATA[b].name})の間に微妙な空気が漂い、会話も弾まなかった。全員、少し疲れた気分でキャンプに着いた。`,
      effectText: "全員のHPが8減少。",
      effect: { type: "damage_all", amount: 8 }
    }
  ]
};

// =============================================
// ROAD EVENT TEMPLATES — MEMBER BASED
// パーティーメンバーのMBTIタイプによる道中イベント
// =============================================
const ROAD_EVENT_MEMBER_TEMPLATES = {
  INFJ: {
    title: "✨ INFJの傾聴",
    getDesc: () => `INFJ(提唱者)が全員の話を静かに聞き、心の疲れを癒してくれた。「みんな、よく頑張ってるよ」その言葉が全員の心に深く染み渡った。`,
    effectText: "全員のHPが20回復！精神的な疲れが癒えた。",
    effect: { type: "heal_all", amount: 20 }
  },
  ENFJ: {
    title: "✨ ENFJの熱いスピーチ",
    getDesc: () => `ENFJ(主人公)が焚き火の前で力強いスピーチ！「一人じゃない、みんなで戦おう！諦めるな！」チーム全体の士気が爆上がりした！`,
    effectText: "次のバトルで全員の攻撃力が1.3倍！",
    effect: { type: "atk_buff_all", amount: 1.3 }
  },
  ENTJ: {
    title: "⚔️ ENTJの戦略会議",
    getDesc: () => `ENTJ(指揮官)が地図を広げ、徹底的な作戦会議を開催。「次の戦いはこの陣形で行く！」確信に満ちた言葉に全員が頷いた。`,
    effectText: "次のバトルで全員の攻撃力が1.25倍！",
    effect: { type: "atk_buff_all", amount: 1.25 }
  },
  INTJ: {
    title: "🔭 INTJの長期計画",
    getDesc: () => `INTJ(建築家)が一晩中地図と睨めっこし、最適な戦略を導き出した。「次の戦いは俺のプランに従え。勝てる」`,
    effectText: "次のバトルで全員の攻撃力が1.2倍！",
    effect: { type: "atk_buff_all", amount: 1.2 }
  },
  INTP: {
    title: "🔬 INTPの敵分析",
    getDesc: () => `INTP(論理学者)がキャンプで黙々と敵を研究していた。翌朝「弱点を発見した。次の戦いで活かせる」と一言。`,
    effectText: "次のバトルで敵全体の防御が下がった状態でスタート！",
    effect: { type: "enemy_def_pre_down" }
  },
  ENTP: {
    title: "🧠 ENTPの奇策",
    getDesc: () => `ENTP(討論者)が「これはどうだ！みんな聞けよ！」と斬新なアイデアを提案。半信半疑で試したら意外とうまくいった！`,
    effectText: "全員のHPが15回復し、攻撃力もランダムにアップ！",
    effect: { type: "heal_and_random_atk_buff", heal: 15 }
  },
  INFP: {
    title: "🌸 INFPの物語の夜",
    getDesc: () => `INFP(仲介者)が焚き火の前で美しい物語を語り始めた。星空の下、全員がその世界に引き込まれ、いつの間にか疲れを忘れていた。`,
    effectText: "全員のHPが20回復！",
    effect: { type: "heal_all", amount: 20 }
  },
  ENFP: {
    title: "🌟 ENFPの元気玉",
    getDesc: () => `ENFP(運動家)の底抜けの明るさがパーティーに伝染！「ねえ、次の戦いめっちゃ楽しそうじゃない！？」その前向きさに全員が笑顔になった。`,
    effectText: "全員のHPが18回復！攻撃力も少し上がった！",
    effect: { type: "heal_and_atk_buff", heal: 18, atkBuff: 1.1 }
  },
  ISTJ: {
    title: "🗺️ ISTJの周到な準備",
    getDesc: () => `ISTJ(ロジスティシャン)が緻密な計画を立て、装備のメンテナンスも完璧にこなした。「準備が整えば、勝てる」その安心感が全員を癒した。`,
    effectText: "全員のHPが15回復。次バトルの防御力もアップ！",
    effect: { type: "heal_and_def_buff", heal: 15, defBuff: 1.2 }
  },
  ISFJ: {
    title: "🌿 ISFJの献身的なケア",
    getDesc: () => `ISFJ(擁護者)が誰にも言わず全員の装備を磨き、傷の手当てをしてくれていた。目が覚めたら傷が癒えていた。「気づいてた...ありがとう」`,
    effectText: "全員のHPが22回復！",
    effect: { type: "heal_all", amount: 22 }
  },
  ESTJ: {
    title: "⚖️ ESTJの規律",
    getDesc: () => `ESTJ(幹部)が「規律を守れ！」と号令をかけ、みんなを規律正しい生活リズムに導いた。おかげで体調が整った。`,
    effectText: "全員のHPが15回復。防御力も少しアップ！",
    effect: { type: "heal_and_def_buff", heal: 15, defBuff: 1.15 }
  },
  ESFJ: {
    title: "🍳 ESFJの手料理",
    getDesc: () => `ESFJ(領事)がみんなのために特製料理を作ってくれた。「みんなの好きなものを全部入れたよ！」優しい味に全員が癒された。`,
    effectText: "全員のHPが28回復！温かい気持ちになれた。",
    effect: { type: "heal_all", amount: 28 }
  },
  ISTP: {
    title: "🔧 ISTPの武器メンテ",
    getDesc: () => `ISTP(巨匠)が全員の武器と装備を黙々とメンテナンスしてくれた。「これで最高の状態だ」次のバトルで装備が万全だ。`,
    effectText: "次のバトルで全員の攻撃力が1.2倍！",
    effect: { type: "atk_buff_all", amount: 1.2 }
  },
  ISFP: {
    title: "🎨 ISFPのスケッチ",
    getDesc: () => `ISFP(冒険家)が道中の美しい景色を描いたスケッチをみんなに見せてくれた。その絵を眺めているとなぜか心が落ち着いた。`,
    effectText: "全員のHPが12回復！穏やかな気持ちになれた。",
    effect: { type: "heal_all", amount: 12 }
  },
  ESTP: {
    title: "🎲 ESTPの大冒険",
    getDesc: () => `ESTP(起業家)が「こっちの方が絶対近道だ！」と言って脇道に突撃。結果は...運命に委ねよう。`,
    effectText: "50%でHP40回復！50%でHP20減少！",
    effect: { type: "gamble", winHeal: 40, loseDamage: 20 }
  },
  ESFP: {
    title: "🎉 ESFPのパーティータイム",
    getDesc: () => `ESFP(エンターテイナー)がその場の雰囲気をぶち上げた！歌って踊って大盛り上がり！「俺たちは最強だ！」疲れが吹き飛んだ！`,
    effectText: "全員のHPが22回復！テンション爆上がり！",
    effect: { type: "heal_all", amount: 22 }
  }
};

// Generic road events (fallback)
const ROAD_EVENTS_GENERIC = [
  {
    title: "✨ 回復の泉",
    description: "道中に神秘的に輝く泉を発見した。パーティーは休憩し、清らかな水で傷を癒した。",
    effectText: "パーティー全員のHPが20回復した！",
    effect: { type: "heal_all", amount: 20 }
  },
  {
    title: "💰 宝箱",
    description: "古い宝箱を発見した！中から不思議なオーラが溢れ出す。力が漲ってくる！",
    effectText: "次のバトルで全員の攻撃力が1.2倍になった！",
    effect: { type: "atk_buff_all", amount: 1.2 }
  },
  {
    title: "⛈️ 嵐",
    description: "突然の嵐に見舞われた！激しい風雨がパーティーを苦しめる。",
    effectText: "パーティー全員が15のダメージを受けた！",
    effect: { type: "damage_all", amount: 15 }
  },
  {
    title: "🌟 精霊の加護",
    description: "光輝く精霊が現れ、パーティーを見守ってくれた！",
    effectText: "一番HPが少ない仲間が50回復した！",
    effect: { type: "heal_min_hp", amount: 50 }
  },
  {
    title: "⚠️ 落とし穴",
    description: "不意に地面が崩れ、パーティーは罠にはまってしまった！",
    effectText: "パーティー全員が10のダメージを受けた！",
    effect: { type: "damage_all", amount: 10 }
  }
];

// Credits
const CREDITS_TEXT = [
  { label: "ゲームデザイン・企画", value: "あなた & チーム" },
  { label: "MBTIデータ", value: "MBTILIST_complete.xlsx より" },
  { label: "ゲームシステム", value: "mbti_battle_idea.pptx より" },
  { label: "開発", value: "Web Game Lab" },
  { label: "Special Thanks", value: "16personalities.com" }
];
