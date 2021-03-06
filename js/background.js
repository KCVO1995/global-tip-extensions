//  全局提示 - 持久存储 - OK
//    定时提示 - OK
//      可以直接关闭 - OK
//      可以延时提示 - OK
//    提示类型
//      - alert - OK
//      - warning - OK
//      - tip - OK
//  页面提示 - 持久存储

const globalTips = [
  {
    id: 1,
    triggerTime: `17:45`,
    laterTime: '',
    text: '大佬，关禅道啦！',
    type: 'alert'
  },
  // {
  //   id: 2,
  //   triggerTime: `17:${window.xxx}`,
  //   laterTime: '',
  //   text: '大佬，关禅道啦！',
  //   type: 'warning'
  // },
  // {
  //   id: 3,
  //   triggerTime: `17:${window.xxx}`,
  //   laterTime: '',
  //   text: '大佬，关禅道啦！',
  //   type: 'tip'
  // },
]

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    globalTips,
    pageTips: []
  })
  console.log('存储设置成功')
})

const sendToTab = (message) => {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, message);
    })
  });
}

const add15Min = () => {
  const date = dayjs(new Date()).add(1, 'm')
  return `${date.get('h')}:${date.get('m')}`
}

//  当到达 specialTime 时
//  检查是否有到时的 tip，如果有发送到所有 tab
//  tab 弹出弹窗
//    当弹窗关闭时，通知 background 转发到所有 tab，所有 tab 关闭弹窗, 如有延时时间清除
//    当弹窗延时时，通知 background 转发到所有 tab，所有 tab 关闭弹窗, 并基于当前时间修改延时时间

const runGlobalTips = () => {
  let globalTips = []

  const getGlobalTipById = (id) => {
    return globalTips.find(tip => tip.id === id)
  }

  const openGlobalTip = (tip) => {
    console.log('open')
    sendToTab({
      msg: 'show global tip',
      value: { tip }
    })
  }

  const closeGlobalTip = (id) => {
    const tip = getGlobalTipById(id)
    tip.laterTime = ''
    sendToTab({ msg: 'close global tip', value: {tip} }) // 转发到全部 Tab
  }

  const laterGlobalTip = (id) => {
    const tip = getGlobalTipById(id)
    closeGlobalTip(id)
    tip.laterTime = add15Min()
  }


  const checkTips = (time) => {
    globalTips.forEach((tip) => {
      if (time === tip.triggerTime || time === tip.laterTime) { // 触发提示
        openGlobalTip(tip)
      }
    })
  }

  const onSpecialTime = (time) => {
    checkTips(time)
  }

  const fetchGlobalTips = () => {
    chrome.storage.sync.get('globalTips', (result) => {
      globalTips = result.globalTips
      console.log('globalTips', globalTips)
    })
  }


  setTimeout(() => {
    sendToTab({
      msg: 'show global tip',
      value: {tip: globalTips[0]}
    })
  }, 3000)

  // setTimeout(() => {
  //   sendToTab({
  //     msg: 'show global tip',
  //     value: {tip: globalTips[1]}
  //   })
  // }, 4000)
  //
  // setTimeout(() => {
  //   sendToTab({
  //     msg: 'show global tip',
  //     value: {tip: globalTips[2]}
  //   })
  // }, 5000)

  chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.msg === 'close global tip') { // 单个Tab请求关闭弹窗
      console.log('关闭 1 个')
      const {value: {id}} = request
      closeGlobalTip(id)
    }
    if (request.msg === 'later global tip') { // 稍后提醒
      const {value: {id}} = request
      laterGlobalTip(id)
    }
  });

  const init = () => {
    specialTime(onSpecialTime)
    fetchGlobalTips()
  }

  init()

}

runGlobalTips()
