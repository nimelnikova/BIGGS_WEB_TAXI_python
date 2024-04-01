from flask import abort
import hashlib

# Словарь PEOPLE, содержащий информацию о людях
# словарь {"login": {"login": People, "history": {id_order: Order}}}
# People содержит почту логин пароль имя фамилия
# Order
 # пользователи хранятся в словаре вида {"lname": {"lname": "", "fname": "", "email": "", password: "", history: [{id_customer: [""]}]}
PEOPLE = {
    "Sirakov": {"lname": "Sirakov", "fname": "Dmitry"},
"Ivanov": {"lname": "Ivanov", "fname": "Ivan"},
"Petrov": {"lname": "Petrov", "fname": "Petr"},
"Sidorov": {"lname": "Sidorov", "fname": "Sidor"},
}

def get_all_people():
    """
    Получает список всех людей.

    Returns:
        list: Список словарей, представляющих информацию о каждом человеке.
    """
    return list(PEOPLE.values())


def create_person(body):
    """
    Создает нового человека.

    Args:
        body (dict): Словарь с данными о человеке, содержащий 'lname' (фамилия) и 'fname' (имя).

    Returns:
        tuple: Кортеж, содержащий словарь с информацией о новом человеке и код состояния HTTP.
    """
    people = body
    lname = people.get("lname", "")
    fname = people.get("fname", "")
    if lname and lname not in PEOPLE:
        PEOPLE[lname] = {"lname": lname, "fname": fname}
        return PEOPLE[lname], 201
    # Если человек с такой фамилией уже существует, возвращает ошибку 406
    return abort(406, f"Person with last name {lname} already exists")


def get_person(lname):
    """
    Получает информацию о человеке по фамилии.

    Args:
        lname (str): Фамилия человека.

    Returns:
        dict: Словарь с информацией о человеке.
    """
    if lname and lname in PEOPLE:
        return PEOPLE[lname]
    # Если человек с указанной фамилией не найден, возвращает ошибку 404
    return abort(404, f"Person with last name {lname} not found")


def update_person(lname, body):
    """
    Обновляет информацию о человеке по фамилии.

    Args:
        lname (str): Фамилия человека.
        body (dict): Словарь с данными для обновления.

    Returns:
        dict: Обновленная информация о человеке.
    """
    if lname and lname in PEOPLE:
        PEOPLE[lname] = body
        return PEOPLE[lname]
    # Если человек с указанной фамилией не найден, возвращает ошибку 404
    return abort(404, f"Person with last name {lname} not found")


def delete_person(lname):
    """
    Удаляет человека по фамилии.

    Args:
        lname (str): Фамилия человека.

    Returns:
        dict: Информация о удаленном человеке.
    """
    if lname and lname in PEOPLE:
        return PEOPLE.pop(lname)
    # Если человек с указанной фамилией не найден, возвращает ошибку 404
    return abort(404, f"Person with last name {lname} not found")


def hash_order_id(order_id):
    order_id_bytes = str(order_id).encode('utf-8')

    hasher = hashlib.sha256()

    hasher.update(order_id_bytes)

    hashed_order_id = hasher.hexdigest()

    return hashed_order_id

def create_order(order):




def get_all_trips(lname):
    if lname and lname in PEOPLE and len(PEOPLE[lname]) > 2:
        for i in range(2, len(PEOPLE[lname])):
            yield PEOPLE[lname][i].value
