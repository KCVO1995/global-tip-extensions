const sendToBackground = (message) => {
  chrome.runtime.sendMessage(message);
}
const runGlobalTips = () => {
  const pops = []
  const defaultZIndex = 9999
  const closeImgURL = chrome.runtime.getURL("img/close_white.png");
  const laterImgURL = chrome.runtime.getURL("img/later_white.png");

  const fixZIndex = () => {
    pops.forEach(pop => pop.style.zIndex = (parseInt(pop.style.zIndex) - 1).toString())
  }

  const closeGlobalPop = (tip) => {
    console.log('close')
    const popIndex = pops.findIndex(pop => parseInt(pop.id) === tip.id)
    const pop = pops.splice(popIndex, 1)
    console.log(pop, 'pop')
    pop[0].remove()
    fixZIndex()
  }

  const openGlobalPop = (tip) => {
    renderTip(tip)
  }

  const getLastZIndex = () => {
    if (pops.length === 0) return defaultZIndex
    const lastPop = pops[pops.length - 1]
    return parseInt(lastPop.style.zIndex)
  }

  const renderTip = (tip) => {
    console.log('render 1 个')
    const pop = document.createElement('div')
    pop.className = `global-pop-extension ${tip.type}-extension`
    pop.id = tip.id
    pop.style.zIndex = (getLastZIndex() + 1).toString()
    pop.innerHTML = `
      <div class="pop-wrapper-extension">
        <div class="later-extension">
          <img 
            id="later-extension-${tip.id}"
            src="${laterImgURL}" 
            alt="">
        </div>
        <div class="content-extension">${tip.text}</div>
        <div class="close-extension">
          <img 
            id="close-extension-${tip.id}"
            src="${closeImgURL}" 
            alt="">
        </div>
      </div>
    `
    pops.push(pop)
    document.body.appendChild(pop)
    document.getElementById(`close-extension-${tip.id}`).addEventListener('click', () => {
      sendToBackground({msg: 'close global tip', value: {id: tip.id}})
    })
    document.getElementById(`later-extension-${tip.id}`).addEventListener('click', () => {
      sendToBackground({msg: 'later global tip', value: {id: tip.id}})
    })
  }

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if(request.msg === 'show global tip') {
      const { value: { tip }} = request
      openGlobalPop(tip)
    }
    if(request.msg === 'close global tip') {
      const { value: { tip }} = request
      closeGlobalPop(tip)
    }
  });
}

runGlobalTips()
