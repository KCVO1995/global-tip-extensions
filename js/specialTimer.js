const SPECIAL_TIME = [0, 15, 30 ,45]

// 通过秒计时器获取整分钟，通过分钟计时器获取特殊时间点，有效节省计时器对性能对消耗
window.specialTime = (onTime) => {
  let secondTimerId = null
  let minuteTimerId = null
  let specialTimerId = null
  const onTheMinute = () => {
    const sec = new Date().getSeconds()
    if (sec === 0) { // 到了整数分钟
      window.clearInterval(secondTimerId)
      secondTimerId = null
      if (!onSpecialTime()) runMinuteTimer()
    }
  }

  const onSpecialTime = () => {
    const hour = new Date().getHours()
    const min = new Date().getMinutes()
    if (SPECIAL_TIME.includes(min)) { // 到了整数分钟
      if (minuteTimerId) {
        window.clearInterval(minuteTimerId)
        minuteTimerId = null
      }
      onTime(`${hour}:${min}`)
      runSpecialTimer()
      return true
    }
    return false
  }

  const runSecondTimer = () => {
    secondTimerId = setInterval(() => {
      // console.log('秒', new Date().toLocaleTimeString())
      onTheMinute()
    }, 1000)
  }

  const runMinuteTimer = () => {
    minuteTimerId = setInterval(() => {
      // console.log('分', new Date().toLocaleTimeString())
      onSpecialTime()
    }, 1000 * 60)
  }

  const runSpecialTimer = () => {
    specialTimerId = setInterval(() => {
      const hour = new Date().getHours()
      const min = new Date().getMinutes()
      onTime(`${hour}:${min}`)
    }, 1000 * 60)
    // TODO 15 分钟
  }

  runSecondTimer()
}
