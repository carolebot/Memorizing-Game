// 宣告花色陣列
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const view = {
  // getCardElement: function getCardElement(){}
  getCardElement(index) {
    // 卡片索引綁到 HTML 元素
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    //根據參數 index 來計算現在是哪一個花色：1~52 4個花色
    //0 - 12：黑桃 1 - 13
    //13 - 25：愛心 1 - 13
    //26 - 38：方塊 1 - 13
    //39 - 51：梅花 1 - 13
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return ` 
      <p>${number}</p>
        <img src="${symbol}" alt="">
      <p>${number}</p> 
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards(...cards) {
    console.log(...cards)
    cards.map(card => {
      if (card.classList.contains('back')) {
        //如果是背面回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        //事件執行一次之後，就要卸載這個監聽器
        event.target.classList.remove('wrong'), { once: ture }
      })
    })

  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }


}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    //不是點牌背 就什麼都不做
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      // 等待翻牌狀態
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        //翻牌後紀錄
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        console.log(model.isRevealedCardMatched())
        //配對成功 更新狀態
        if (model.isRevealedCardMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          //改變樣式
          view.pairCards(...model.revealedCards)
          //變回起始狀態
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits

          //配對失敗 更新狀態 翻回來
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          //settimeout第一個值不能加括號 加括號是回傳結果 這邊要的是function
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current state:', this.currentState)
    console.log('revealCards:', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  // 集滿兩張牌時就要檢查配對有沒有成功，檢查完以後，這個暫存牌組就需要清空
  revealedCards: [],
  isRevealedCardMatched() {

    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13

  },
  score: 0,

  triedTimes: 0
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    // 從最後一張開始 每一張跟前面任一張random交換
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      //最後一張 被挑中的 兩個值交換 如果用一個暫存變數會比較麻煩 解構賦值 []前面加上;
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// 翻牌監聽 map 會因為nodelist不能啟用
controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})

