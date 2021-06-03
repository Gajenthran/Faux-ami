export const IMGS = {
  titlePostIt: require('./../assets/img/title-post.png'),
  postIt: require('./../assets/img/post.png'),
  map: require('./../assets/img/map.png'),
  calendar: require('./../assets/img/calendar.png'),
  pin: require('./../assets/img/pin.png'),
  spy: require('./../assets/img/spy.png'),
  profile: require('./../assets/img/profile.png'),
  crown: require('./../assets/img/crown.png'),
  fullScreen: require('./../assets/img/full-screen.png'),
}

export const AVATAR_POS_STYLE = [
  // 4 players
  [
    { position: "absolute", top: "40%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "2%", right: "48%" },
    { position: "absolute", top: "40%", right: "5%", flexDirection: "row-reverse" }
  ],
  // 5 players
  [
    { position: "absolute", top: "40%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "2%", right: "25%" },
    { position: "absolute", top: "2%", right: "75%" },
    { position: "absolute", top: "40%", right: "5%", flexDirection: "row-reverse" }
  ],
  // 6 players
  [
    { position: "absolute", top: "40%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "2%", right: "14%" },
    { position: "absolute", top: "2%", right: "48%" },
    { position: "absolute", top: "2%", right: "80%" },
    { position: "absolute", top: "40%", right: "5%", flexDirection: "row-reverse" }
  ],
  // 7 players
  [
    { position: "absolute", top: "20%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "60%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "2%", right: "30%" },
    { position: "absolute", top: "2%", right: "60%" },
    { position: "absolute", top: "60%", right: "5%", flexDirection: "row-reverse" },
    { position: "absolute", top: "20%", right: "5%", flexDirection: "row-reverse" }
  ],
  // 8 players
  [
    { position: "absolute", top: "20%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "50%", left: "5%", flexDirection: "row" },
    { position: "absolute", top: "2%", right: "28%" },
    { position: "absolute", top: "2%", right: "48%" },
    { position: "absolute", top: "2%", right: "66%" },
    { position: "absolute", top: "50%", right: "5%", flexDirection: "row-reverse" },
    { position: "absolute", top: "20%", right: "5%", flexDirection: "row-reverse" }
  ],
]

export const NAME_POS_STYLE = [
  // 4 players
  [
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0" },
  ],

  // 5 players
  [
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0" },
  ],

  // 6 players
  [
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0" },
  ],
  // 7 players
  [
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0" },
  ],
  // 8 players
  [
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0%" },
    { position: "absolute", top: "100%", left: "0" },
    { position: "absolute", top: "100%", left: "0" },
  ]
]

const CARDS_LEFT_STYLE = {
  state: "cards-left",
  card: {
    marginBottom: "-35px",
    transform: "rotateZ(95deg)"
  },
  cards: {
    flexDirection: "column",
    marginLeft: "30px"
  }
}

const CARDS_BOTTOM_STYLE = {
  state: "cards-bottom",
  card: {
    marginRight: "-10px",
    transform: "rotateZ(-185deg)"
  },
  cards: {
    flexDirection: "row",
    left: "-30px",
    top: "130px",
  }
}


const CARDS_RIGHT_STYLE = {
  state: "cards-right",
  card: {
    marginBottom: "-35px",
    transform: "rotateZ(-95deg)"
  },
  cards: {
    flexDirection: "column",
    marginRight: "30px",
    top: "-40px",
  }
}

export const CARDS_POS_STYLE = [
  // 4 players
  [
    CARDS_LEFT_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_RIGHT_STYLE
  ],
  // 5 players
  [
    CARDS_LEFT_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_RIGHT_STYLE
  ],
  // 6 players
  [
    CARDS_LEFT_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_RIGHT_STYLE
  ],
  // 7 players
  [
    CARDS_LEFT_STYLE,
    CARDS_LEFT_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_RIGHT_STYLE,
    CARDS_RIGHT_STYLE
  ],
  // 7 players
  [
    CARDS_LEFT_STYLE,
    CARDS_LEFT_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_BOTTOM_STYLE,
    CARDS_RIGHT_STYLE,
    CARDS_RIGHT_STYLE
  ],
]

export const TEAM_ENUM = {
  "protagonist": 1,
  "antagonist": 2
}
Object.freeze(TEAM_ENUM)

export const STATE_ENUM = {
  "idle": 0,
  "win": 1,
  "loose": 2
}

Object.freeze(STATE_ENUM)