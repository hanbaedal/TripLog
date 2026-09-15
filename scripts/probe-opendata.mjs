const form = new URLSearchParams({
  publicDataPk: '15025456',
  searchKeyword1: '대구',
  colCondition: '시군구명',
})
const res = await fetch('https://www.data.go.kr/tcs/dss/selectStdDataDetailView.do', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: form,
})
const text = await res.text()
console.log('status', res.status, 'len', text.length)
console.log(text.slice(0, 1500))
