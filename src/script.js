class ConvertorAPI {

    static async getRate (from, to) {
        if(from === to) return 1;

        const res  = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}&places=4`)
        const json = await res.json()
        return json.rates[to];
    }

    static async convert (from, to, amount) {
        if(from === to) return amount;

        const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}&places=4`)
        const json = await res.json()
      return json.result;
    }

    static async getSupportedSymbols () {
        const res = await fetch('https://api.exchangerate.host/symbols')
        const json = await res.json()
        return Object.keys(json.symbols)
    }

}

class Convertor {

    from = document.querySelector('.main__for-exchange')
    to = document.querySelector('.main__to-get-exchanged')

    fromInput = this.from.querySelector('input')
    toInput = this.to.querySelector('input')

    fromRate = this.from.querySelector('.convertor__rate')
    toRate = this.to.querySelector(".convertor__rate")

    fromSelect = this.from.querySelector('select')
    toSelect = this.to.querySelector("select")

    switchButton = document.querySelector('.main__toggle')


    fromCurrency = 'RUB';
    toCurrency = 'USD';


    constructor() {
        this.fromInput.addEventListener('input', this.convert)
        this.toInput.addEventListener('input', this.reverseConvert)
        document.querySelectorAll('.main__default-cur')
            .forEach(button => button.addEventListener('click', this.handleClickToCurrencyButton));
        document.querySelectorAll('select')
            .forEach(select => select.addEventListener('change', this.handleChangeSelect));    

        this.switchButton.addEventListener('click', (e) => {
            e.preventDefault()

            let a = this.fromInput.value
            this.fromInput.value = this.toInput.value
            this.toInput.value = a    // замена значений input

            let b = this.fromRate.textContent
            this.fromRate.textContent = this.toRate.textContent
            this.toRate.textContent = b // замена значений подстрочника

            let fromActiveButton = this.from.querySelector(".active").value
            let toActiveButton = this.to.querySelector(".active").value
            this.fromCurrency = toActiveButton
            this.toCurrency = fromActiveButton

            this.from.querySelector(".active").classList.remove("active");
            this.to.querySelector(".active").classList.remove("active");

            this.from.querySelectorAll('.main__default-cur').forEach(btn => {
                if (btn.value === toActiveButton) {
                    btn.classList.add('active')
                }
            }) // замена свечения у правого стандартного button

            this.to.querySelectorAll('.main__default-cur').forEach(btn => {
                if (btn.value === fromActiveButton) {
                    btn.classList.add('active')
                }
            }) // замена свечения у правого стандартного button

            if(!this.from.querySelector('.active')) {
                this.from.querySelector('select').querySelectorAll('option').forEach(opt => {
                    if (opt.value === toActiveButton) {
                        this.from.querySelector('select').setAttribute('value', toActiveButton)
                        this.from.querySelector('select').classList.add('active')
                    }
                })
            } // замена свечения у правого option

            if(!this.to.querySelector('.active')) {
                this.to.querySelector('select').querySelectorAll('option').forEach(opt => {
                    if (opt.value === fromActiveButton) {
                        this.to.querySelector('select').setAttribute('value', fromActiveButton)
                        this.to.querySelector('select').classList.add('active')
                    }
                })
            } // замена свечения у левого option

        })

        this.init();
    }

    convert = async () => {
        this.toInput.value = await ConvertorAPI.convert(this.fromCurrency, this.toCurrency, this.fromInput.value)
    }

    reverseConvert = async () => {
        this.fromInput.value = await ConvertorAPI.convert(this.toCurrency, this.fromCurrency, this.toInput.value)
    }

    init() {
        this.fromInput.value = 1;
        this.update()
        this.initSupportedSymbols()
    }


    update() {
        this.convert()
        this.setRate()

        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        this.from.querySelector(`[value=${this.fromCurrency}]`).classList.add('active') // ищем кнопку с атрибутом value равным текущей выбранной валюте в классе
        this.to.querySelector(`[value=${this.toCurrency}]`).classList.add('active') 
    }

    async  initSupportedSymbols() {
        const supportedSymbols = await ConvertorAPI.getSupportedSymbols();
        document.querySelectorAll('select').forEach(select => {
            select.append(...supportedSymbols.map(symbol => this.createOption(symbol)));
        })
           

        // append(elem1, elem2, ...)
        // спред-оператор для конвертации массива в стоки 
    }
    

    createOption(symbol) {
        const option = document.createElement('option')
        option.value = symbol
        option.textContent = symbol
        return option
    }

    async setRate() {
        const rate = await ConvertorAPI.getRate(this.fromCurrency, this.toCurrency)
        this.fromRate.textContent = this.getRateString(this.fromCurrency, this.toCurrency, rate)
        this.toRate.textContent = this.getRateString(this.toCurrency, this.fromCurrency, +(1/rate).toFixed(4))
    }

    // async setToRate() {
    //     const rate = ConvertorAPI.getRate(this.toCurrency, this.fromCurrency)
    //     this.toRate.textContent = this.getRateString(this.toCurrency, this.fromCurrency, rate)
    // }

    

    handleChangeSelect = (event) => {
        if (event.target.closest('.main__for-exchange')) {
            this.fromCurrency = event.target.value;
       }  else {
            this.toCurrency = event.target.value;
       }
       event.target.setAttribute('value', event.target.value)
       this.update()
    }

    handleClickToCurrencyButton = async (event) =>  {
       if (event.target.closest('.main__for-exchange')) {
            this.fromCurrency = event.target.value;
       }  else {
            this.toCurrency = event.target.value;
       }
       this.update()
    }

    getRateString = (from, to, rate) => `1 ${from} = ${rate} ${to}`
}

const convertor = new Convertor()