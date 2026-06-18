# 🎵 sounds/ — 音声素材配置ガイド

ゲームBGMと効果音をここに配置してください。
音声ファイルがない場合でも、ゲームは音なしで動作します。

---

## BGM ファイル

| ファイル名 | 使用場面 | 雰囲気 |
|-----------|--------|------|
| bgm_title.mp3 | タイトル画面 | 壮大・ファンタジー |
| bgm_battle.mp3 | 通常バトル | アクション・テンポ早め |
| bgm_boss.mp3 | ボスバトル | 緊張感・重厚 |
| bgm_event.mp3 | 道中イベント | 日常・穏やか |
| bgm_clear.mp3 | ゲームクリア | 勝利・明るい |
| bgm_over.mp3 | ゲームオーバー | 悲しい・短め |

---

## 効果音 ファイル

| ファイル名 | 使用タイミング |
|-----------|------------|
| se_attack.mp3 | 通常攻撃 |
| se_special.mp3 | 特技使用 |
| se_magic.mp3 | 魔法・特殊スキル |
| se_damage.mp3 | ダメージを受ける |
| se_buff.mp3 | バフ発動 |
| se_debuff.mp3 | デバフ発動 |
| se_heal.mp3 | 回復 |
| se_critical.mp3 | クリティカルヒット |
| se_victory.mp3 | バトル勝利 |
| se_defeat.mp3 | バトル敗北 |
| se_button.mp3 | ボタンクリック |
| se_cursor.mp3 | カーソル移動 |

---

## 対応形式

- `.mp3` — 推奨（ブラウザ互換性が最も高い）
- `.ogg` — Firefox等での代替
- `.wav` — 効果音向け（ファイルサイズに注意）

---

## 音声を実装に追加する方法

`js/game.js` の先頭付近に以下を追加することで音声を有効化できます：

```javascript
// 音声システムの例
const Audio = {
  bgm: null,
  playBGM(src) {
    if (this.bgm) this.bgm.pause();
    this.bgm = new Audio(src);
    this.bgm.loop = true;
    this.bgm.volume = 0.5;
    this.bgm.play().catch(() => {});
  },
  playSE(src) {
    const se = new Audio(src);
    se.volume = 0.7;
    se.play().catch(() => {});
  }
};
```
