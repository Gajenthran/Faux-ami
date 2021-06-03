const fs = require('fs')
const path = require('path')
const { getUserIndex } = require('./users')

const NB_CARDS = 3
const NB_CARDS_TO_DIST = 5
const MIN_NB_PLAYERS = 4
const NB_TURN = 1
const NB_ROUND = 2
// TODO: add to options
const TEAM_ENUM = {
  "spy": 0,
  "protagonist": 1,
}
Object.freeze(TEAM_ENUM)


const COUNTDOWN = 1000 * 2 // milliseconds

const NB_KEYWORDS = 3

const TEAM_SPLIT = [
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [3, 5],
]

const CARDS_ENUM = {
  "secure": 0,
  "defuse": 1,
  "bomb": 2
}
Object.freeze(CARDS_ENUM)

const CARDS_IDS = [
  { name: "secure", type: 0 },
  { name: "defuse", type: 1 },
  { name: "bomb", type: 2 }
]

const STATE_ENUM = {
  "idle": 0,
  "win": 1,
  "loose": 2
}
Object.freeze(STATE_ENUM)


/**
 * Get all cards from cards.json
 */
 const ARTICLES_JSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/articles.json'))
)

/**
 * Get cards property from cards.
 */
const ARTICLES = ARTICLES_JSON.articles

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const shuffleArray = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

const removeArray = (arr, value) => {
  const index = arr.indexOf(value) !== -1
  if(index !== -1)
    arr.splice(index, 1)
}

/**
 * Class representing the game.
 */
class Game {
  constructor(users, options) {
    this.users = users

    this.round = 0
    this.turn = 0

    this.articleIndexes = Array.from(Array(ARTICLES.length), (_, i) => i)
    shuffleArray(this.articleIndexes)
    // add nbTurn
    this.articleIndexes = this.articleIndexes.slice(0, NB_ROUND);

    this.article = ARTICLES[this.articleIndexes[this.round]]

    // nbPlayer, nbTurn, nbCardsToDistribute, countdown, nbCardsToShow
    this.options = options
    this.countdown = null;
    this.timer = null;

    const keywordsIndexes = Array.from(
      Array(this.article.keywords.length), (_, i) => i
    )
    shuffleArray(keywordsIndexes)

    const keywords = new Array(NB_KEYWORDS).fill(null).map(
      (_, i) => this.article.keywords[keywordsIndexes[i]]
    )

    const spyKeywords = new Array(NB_KEYWORDS).fill(null).map(
      (_, i) => this.article.spyKeywords[keywordsIndexes[i]]
    )

    const userIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(userIndexes)

    for(let i = 0; i < userIndexes.length; i++)
      this.users[userIndexes[i]].role = this.article.players[i]

    const nbSpy = TEAM_SPLIT[this.users.length - MIN_NB_PLAYERS][TEAM_ENUM.spy]
    this.spyIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.spyIndexes)

    for(let i = 0; i < this.users.length; i++)
      this.users[this.spyIndexes[i]].spy = i >= nbSpy ? false : true

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].keywords = this.users[i].spy ? 
        [...spyKeywords] : [...keywords]
      this.users[i].vote = []
      this.users[i].voted = null
      this.users[i].score = 0
      this.users[i].currentScore = 0
    }

    this.usersOrder = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.usersOrder)
    this.currentPlayer = 0;
  }


  update() {
    if(this.turn === NB_TURN) {
      this.resetCountdown()
      this.clearCountdown()
      return true
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.users.length
    if(this.currentPlayer === 0) this.turn++

    const endRound = this.turn === NB_TURN
    if(endRound) {
      this.resetCountdown()
      this.clearCountdown()
    }

    return endRound
  }

  vote(id, userId) {
    if(id === userId)
      return

    const votedPlayer = this.users[getUserIndex(this.users, userId)]
    const user = this.users[getUserIndex(this.users, id)]

    if(user.voted !== null) {
      const previousVoted = this.users.find(usr => user.voted === usr.id)
      if(previousVoted) {
        const removedId = previousVoted.vote.findIndex(voter => voter.id === id)
        previousVoted.vote.splice(removedId, 1)
        user.voted = null
      }
    }

    votedPlayer.vote.push({ 
      id: user.id, 
      img: user.img, 
      name: user.name, 
      confirmed: false 
    })
    user.voted = votedPlayer.id
  }

  checkConfirmation() {
    let nbVotes = 0;
    for(let i = 0; i < this.users.length; i++) {
      for(let v = 0; v < this.users[i].vote.length; v++) {
        if(!this.users[i].vote[v].confirmed) return false
        else nbVotes++
      }
    }

    return nbVotes === this.users.length;
  }

  confirmVote(id) {
    const user = this.users[getUserIndex(this.users, id)]

    if(user && user.voted) {
      const votedPlayer = this.users[getUserIndex(this.users, user.voted)]
      const updatedId = votedPlayer.vote.findIndex(voter => voter.id === id)
      votedPlayer.vote[updatedId].confirmed = true
    }

    return this.checkConfirmation()
  }

  getGameState() {
    return ({
      users: this.users,
      currentPlayer: this.users[this.usersOrder[this.currentPlayer]].id,
      round: this.round,
      article: this.article
    })
  }

  getUsers() {
    return this.users
  }

  endVote() {
    const nbSpy = TEAM_SPLIT[this.users.length - MIN_NB_PLAYERS][TEAM_ENUM.spy]
    for(let i = 0; i < nbSpy; i++) {
      if(this.users[this.spyIndexes[i]].spy) {
        // TODO: strictement ou eq
        const voters = this.users[this.spyIndexes[i]].vote;
        if(voters.length < (this.users.length - 1) / 2) {
          this.users[this.spyIndexes[i]].currentScore += 100;
          if(voters.length === 0)
            this.users[this.spyIndexes[i]].currentScore += 50;
        }
        this.users[this.spyIndexes[i]].score += 
          this.users[this.spyIndexes[i]].currentScore;
      }
    }

    for(let i = 0; i < this.users.length - nbSpy; i++) {
      const userId = this.users[this.spyIndexes[i + nbSpy]].voted;
      for(let s = 0; s < nbSpy; s++) {
        const voted = this.users[this.spyIndexes[s]]
          .vote
          .find(usr => usr.id === userId);
        if(voted) {
          this.users[this.spyIndexes[i + nbSpy]].currentScore += 100
          this.users[this.spyIndexes[i + nbSpy]].score += 
            this.users[this.spyIndexes[i + nbSpy]].currentScore
          break;
        }
      }
    }
  }

  rankUsers() {
    this.users.sort((u1, u2) => (u1.score < u2.score ? 1 : -1))
  }

  newRound() {
    this.round++

    if(this.round >= NB_ROUND) {
      this.rankUsers()
      return false;
    }
    
    
    this.article = ARTICLES[this.articleIndexes[this.round]]
    this.turn = 0;

    const keywordsIndexes = Array.from(
      Array(this.article.keywords.length), (_, i) => i
    )
    shuffleArray(keywordsIndexes)

    const keywords = new Array(NB_KEYWORDS).fill(null).map(
      (_, i) => this.article.keywords[keywordsIndexes[i]]
    )

    const spyKeywords = new Array(NB_KEYWORDS).fill(null).map(
      (_, i) => this.article.spyKeywords[keywordsIndexes[i]]
    )

    const userIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(userIndexes)

    for(let i = 0; i < userIndexes.length; i++)
      this.users[userIndexes[i]].role = this.article.players[i]

    const nbSpy = TEAM_SPLIT[this.users.length - MIN_NB_PLAYERS][TEAM_ENUM.spy]
    this.spyIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.spyIndexes)

    for(let i = 0; i < this.users.length; i++)
      this.users[this.spyIndexes[i]].spy = i >= nbSpy ? false : true

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].keywords = this.users[i].spy ? 
        [...spyKeywords] : [...keywords]
      this.users[i].vote = []
      this.users[i].voted = null
      this.users[i].currentScore = 0
    }

    this.usersOrder = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.usersOrder)
    this.currentPlayer = 0;

    return true
  }

  removeUser(id) {
    const index = this.users.findIndex((user) => user.id === id)
    if (index !== -1) this.users.splice(index, 1)
    return index
  }

  disconnect(id) {
    if(id === this.users[this.currentPlayer].id) {
      this.removeUser(id)
      if(this.users.length === 0)
        return true
      let currentPlayer = this.currentPlayer
      do {
        currentPlayer = (currentPlayer + 1) % this.users.length
      } while (this.users[currentPlayer].loose)
      this.currentPlayer = currentPlayer
    } else {
      const index = this.removeUser(id)
      if(index !== -1 && this.currentPlayer > index)
        this.currentPlayer--
    }

    return false
  }

  setCountdown(fct, timeout) {
    this.countdown = setInterval(fct, timeout)
  }

  clearCountdown() {
    clearInterval(this.countdown)
  }

  resetCountdown() {
    const now = new Date()
    this.timer = {
      start: now.getTime(),
      end: now.getTime() + COUNTDOWN
    }
  }

  getTimer() {
    return this.timer
  }

  setEndTurn() {
    this.resetCountdown()
    this.clearCountdown()
  }

}

module.exports = Game
