new Vue({
    el: "#app",
    data() {
        return {
            currentCardBackground: Math.floor(Math.random() * 15 + 1),
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

        validateCardName() {
            this.cardName = this.cardName.replace(/[^a-zA-Z\s]/g, '').toUpperCase();

            let words = this.cardName.split(/\s+/);
            if (words.length > 2) {
                // Если слов более двух, оставляем только первые два слова
                this.cardName = words.slice(0, 2).join(' ');
            }
        },


        validateCvv() {
            this.cardCvv = this.cardCvv.replace(/[^\d]/g, '').slice(0, 3);
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
        handleEnter(nextInputId, event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const nextInput = this.$refs[nextInputId];
                if (nextInput) {
                    nextInput.focus();
                }
            }
        },

        formatCardNumber() {
            let value = this.cardNumber.replace(/[^\d]/g, ''); // удаляет все кроме цифр
            if (value.length > 16) {
                value = value.substring(0, 16); // обрезает до 16 цифр
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
            const userId = parseInt(localStorage.getItem('userId'), 10);
            if (isNaN(userId)) {
                alert('Пожалуйста, войдите в систему для выполнения этой операции');
                return;
            }

            if (this.cardNumber && this.cardCvv && this.cardMonth && this.cardYear && this.cardName) {
                const cardData = {
                    id: userId,
                    card_number: this.cardNumber.replace(/\s/g, ''),
                    card_holder: this.cardName,
                    month: this.cardMonth.toString(),
                    year: this.cardYear.toString(),
                    cvv: this.cardCvv
                };

                axios.post('/api/changes/add_card', cardData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        alert('Карта успешно добавлена: ' + response.data.message);
                        window.location.href = '/main.html';
                    })
                    .catch(error => {
                        console.error('Ошибка при добавлении карты:', error);
                        alert('Ошибка: ' + (error.response && error.response.data ? error.response.data.message : error.message));
                    });
            } else {
                alert('Пожалуйста, заполните все поля карты');
            }
        },


    }
});
