/* =========================================================
   お店の情報（ここを書き換えればサイト全体に反映されます）
   ※営業時間・価格・メニューは変わることがあります。
     公開前に公式Instagramで最新情報を確認してください。
   ========================================================= */

const SHOP = {
  name: "菓子喫茶 モンブラン",
  address: "東京都千代田区神田神保町1-12-11-1",
  station: "神保町駅から徒歩すぐ",
  instagram: "https://www.instagram.com/montblanc.jimbocho/",
  instagramId: "@montblanc.jimbocho",
  mapQuery: "菓子喫茶 モンブラン 東京都千代田区神田神保町1-12-11-1",

  /* 曜日ごとの営業時間（0=日 1=月 2=火 3=水 4=木 5=金 6=土）
     null は定休日。時刻は「時」を小数で（8.5 = 8:30） */
  hours: {
    0: { open: 9, close: 18, type: "holiday" },
    1: null,
    2: null,
    3: { open: 8, close: 18, type: "weekday" },
    4: { open: 8, close: 18, type: "weekday" },
    5: { open: 8, close: 18, type: "weekday" },
    6: { open: 9, close: 18, type: "holiday" },
  },

  /* 時間帯ごとの営業内容 */
  bands: {
    weekday: [
      { from: 8, to: 10, label: "モーニング" },
      { from: 10, to: 11, label: "準備中", off: true },
      { from: 11, to: 14, label: "ランチ" },
      { from: 14, to: 18, label: "喫茶" },
    ],
    holiday: [{ from: 9, to: 18, label: "終日 喫茶" }],
  },

  hoursText: [
    { day: "水・木・金", time: "8:00 – 18:00" },
    { day: "土・日・祝", time: "9:00 – 18:00" },
    { day: "定休日", time: "月・火" },
  ],

  /* お品書き：price は数字（円）。未定は null → 「—」と表示 */
  menu: [
    {
      id: "cake",
      label: "CAKE",
      title: "ケーキ",
      items: [
        { name: "たぬきケーキ", price: null, note: "昭和41年から" },
        { name: "ショートケーキ", price: null },
        { name: "マーブルケーキ", price: null },
      ],
    },
    {
      id: "cafe",
      label: "CAFE",
      title: "喫茶",
      items: [
        { name: "プリンアラモード", price: null },
        { name: "クリームソーダ", price: null },
        { name: "メロンクリームソーダ", price: null },
      ],
    },
    {
      id: "food",
      label: "FOOD",
      title: "お食事",
      items: [
        { name: "がめ煮カレー", price: null },
        { name: "エルヴィスサンド", price: null },
      ],
    },
    {
      id: "takeout",
      label: "TAKE OUT",
      title: "お持ち帰り",
      /* ※テイクアウト対象の商品は要確認 */
      items: [
        { name: "たぬきケーキ", price: null },
        { name: "マーブルケーキ", price: null },
        { name: "やせうま", price: null },
      ],
    },
  ],
};

/* =========================================================
   写真（キー → 画像URL）
   HTML の data-photo="キー" の場所に入ります。
   ※いまは社内レビュー用に食べログ投稿写真を仮で読み込んでいます。
     公開前に、お店で撮影した写真（images/ フォルダ）へ必ず差し替えてください。
   ========================================================= */
const TB = "https://tblg.k-img.com/restaurant/images/Rvw/";
const PHOTOS = {
  hero:        TB + "375129/640x640_rect_5152a6dc2aba9f078df0965bdaaa43d7.jpg", // 2F 店内
  storyOita:   TB + "383017/640x640_rect_fa5e75bb18f1db6644cbb13d7bc0e5fd.jpg", // ※大分の昔の写真に差し替え
  storyHands:  TB + "375129/640x640_rect_e665e0652d609c66d226547cdf953039.jpg", // 並んだたぬきケーキ
  storyFamily: TB + "375129/640x640_rect_53587be1b449be6ffe5fa8d27cb30814.jpg", // ※家族・店主の写真に差し替え
  storyShop:   TB + "367683/640x640_rect_ffb5bdc8bae3b0c59ed95e1136795369.jpg", // 店頭
  tanuki:      TB + "374948/640x640_rect_a8e8b111060ad6d89ceb23077c23999f.jpg", // たぬきケーキ
  pudding:     TB + "369208/640x640_rect_b33588eaa81b4dbf0731c80eca67ac16.jpg", // プリンアラモード
  soda:        TB + "368888/640x640_rect_3a1abd8e3d76973936eac9d0fef1abbd.jpg", // クリームソーダ
  showcase:    TB + "383017/640x640_rect_b0c75a8a74056ec635754dbd572465ec.jpg", // ショーケース
  cafe2f:      TB + "385852/640x640_rect_9154586c7405a8299d00c06725c09a64.jpg", // 2F 喫茶室
  cafe3f:      TB + "368888/640x640_rect_2639db92f18aed5fd4027e474ac21bb8.jpg", // 喫茶室の席
  exterior:    TB + "375130/640x640_rect_35a4dad5e9113e2c1adc47dda27e0fbb.jpg", // 赤いオーニングの外観
  tableware:   TB + "365164/640x640_rect_bfe62dc46e2db6c04068e4be86880726.jpg", // 珈琲と器
  interior:    TB + "375129/640x640_rect_c9b1ea7a7d11ce776b75a713ad417686.jpg", // 店内の席
  coaster:     TB + "365164/640x640_rect_d6e279d8b00d15f9650adbd265360e28.jpg", // メッセージ入りのたぬき
  lamp:        TB + "367683/640x640_rect_569624ae58ead0c6186d28ef930fba71.jpg", // 照明とカウンター
  town:        TB + "385852/640x640_rect_49b19f2ad34b00ffb9b83f127fe45e15.jpg", // 建物と街
  cfGift:      TB + "365164/640x640_rect_178d3068788434326c7ab482d7644179.jpg", // たぬきケーキの詰め合わせ
};
