

new Vue({
    el: "#app",
    data() {
        return {
            currentCardBackground: Math.floor(Math.random() * 15 + 1), // just for fun :D
            cardName: "",
            cardNumber: "",
            cardMonth: "",
            cardYear: "",
            cardCvv: "",
            minCardYear: new Date().getFullYear(),
            amexCardMask: "#### ###### #####",
            otherCardMask: "#### #### #### ####",
            cardNumberTemp: "",
            isCardFlipped: false,
            focusElementStyle: null,
            isInputFocused: false,
            lastFourDigits: null,
        };
    },
    mounted() {
        this.cardNumberTemp = this.otherCardMask;
        document.getElementById("cardNumber").focus();
        this.fetchCardData();
    },
    computed: {
        getCardType() {
            let number = this.cardNumber;

            let re = new RegExp("^4");
            if (number.match(re) != null) return "visa";

            re = new RegExp("^5[1-5]");
            if (number.match(re) != null) return "mastercard";

            re = new RegExp("^2202");
            if (number.match(re) != null) return "mir";

            return "visa"; // если тип карты не определен
        },

        generateCardNumberMask() {
            return this.getCardType === "amex" ? this.amexCardMask : this.otherCardMask;
        },
        minCardMonth() {
            if (this.cardYear === this.minCardYear) return new Date().getMonth() + 1;
            return 1;
        }
    },
    watch: {
        cardYear() {
            if (this.cardMonth < this.minCardMonth) {
                this.cardMonth = "";
            }
        }
    },
    methods: {

        formatCardNumber() {
            let value = this.cardNumber.replace(/[^\d]/g, ''); // Удаляет все кроме цифр
            if (value.length > 16) {
                value = value.substring(0, 16); // Обрезает до 16 цифр
            }
            this.cardNumber = value
                .replace(/(.{4})/g, '$1 ') // Добавляет пробелы после каждых 4 цифр
                .trim(); // Удаляет пробелы с концов строки
            if (this.cardNumber.length >= 19) {
                this.cardNumber = this.cardNumber.slice(0, 19); // Обрезает до 19 символов включая пробелы
            }
        },

        flipCard(status) {
            this.isCardFlipped = status;
        },
        focusInput(e) {
            this.isInputFocused = true;
            let targetRef = e.target.dataset.ref;
            let target = this.$refs[targetRef];
            this.focusElementStyle = {
                width: `${target.offsetWidth}px`,
                height: `${target.offsetHeight}px`,
                transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`
            }
        },
        blurInput() {
            let vm = this;
            setTimeout(() => {
                if (!vm.isInputFocused) {
                    vm.focusElementStyle = null;
                }
            }, 300);
            vm.isInputFocused = false;
        },
        fetchCardData() {
            let storedCardData = localStorage.getItem('cardData');
            if (storedCardData) {
                let cardData = JSON.parse(storedCardData);
                this.lastFourDigits = cardData.cardNumber.slice(-4);
            }
        },
        saveCardData() {
            if (this.cardNumber && this.cardCvv && this.cardMonth && this.cardYear) {
                const cardData = {
                    cardNumber: this.cardNumber.replace(/\s/g, ''),
                    cardName: this.cardName,
                    cardMonth: this.cardMonth,
                    cardYear: this.cardYear,
                    cardCvv: this.cardCvv
                };

                localStorage.setItem('cardData', JSON.stringify(cardData));
                this.lastFourDigits = cardData.cardNumber.slice(-4);

                // Отправка события в глобальную область видимости
                window.dispatchEvent(new CustomEvent('cardAdded', { detail: this.lastFourDigits }));
                alert('Карта успешно добавлена');

                // Перенаправление пользователя обратно на главную страницу
                window.location.href = 'main.html';
            } else {
                alert('Пожалуйста, заполните все поля карты');
            }
        }
    }
});