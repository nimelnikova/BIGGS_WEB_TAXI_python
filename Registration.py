class User:

    def init(self, name, mail, password):
        self.name = name
        self.mail = mail
        self.password = password

    def __str(self):
        return f"Пользователь {self.name} с электронной почтой {self.mail}."


class UsersBase:

    def init(self):
        self.users = []
        self.names = []
        self.mails = []


    def add_user(self, user):
        if isinstance(user, User):
            self.users.append(user)
            self.names.append(user.name)
            self.mails.append(user.mail)


    def getitem(self, item):
        return self.users[item]


def CheckNameAndMail(user) -> bool:
    if user.name in users_base.names:
        print("Это имя уже занято.")
        return False
    elif user.mail in users_base.mails:
        print("Аккаунт с такой электронной почтой уже существует.")
        return False
    return True

def Initializing() -> User:
    name = input()
    mail = input()
    password = input()
    return User(name, mail, password)


users_base = UsersBase()

user = Initializing()

while not CheckNameAndMail(user):
    del user
    user = Initializing()
else:
    print("Регистрация завершена!")
    users_base.add_user(user)


for item in users_base.users:
    print(item)