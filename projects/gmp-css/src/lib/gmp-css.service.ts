import {Injectable} from '@angular/core';

/*
* Класс для работы с классами стилей
* ПРИСВОЕНИЕ КЛАССОВ СТИЛЕЙ ПО data атрибуту (чтобы с дизайнерами не пересекаться)
* ПРИМЕР data атрибута в HTML - <div data-gmp_css='gmp_css_1'>ПРИМЕР</div>
* @param название data атрибута 'data-gmp_css' - обязательно!!!
* @param значение data атрибута 'gmp_css_' - обязательно!!!
* ПРИМЕР названия создаваемого класса - 'gmp_css-1'
* @param начала названия класса 'gmp_css-'- обязательно !!!
* Памятка пример (чтобы не путать):
* 'gmp_css-1' - это класс (через тире),
* 'gmp_css_1' - это значение атрибута (через нижнее подчеркивание)
* ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
* createClass('gmp_css-1', '{ color: red; }'); // Создать класс
* applyClass(gmp_css-1', 'data-gmp_css', 'gmp_css_1'); // Применить класс
* ИЛИ 2 В 1 - createApplyCssClass('gmp_css-1', '{ color: red; }', 'data-gmp_css', 'gmp_css_1'); // Создать и Применить класс
* removeCssClass('gmp_css-1', 'data-gmp_css', 'gmp_css_1'); // Удалить класс по data атрибуту
* removeElementStyle(); // Удалить созданный в createCssClass тег style
* removeElementStyleById('test'); // Удалить тег style по id
*/
@Injectable({providedIn: 'root'})
export class GmpCssService {
  public head = document.getElementsByTagName('head')[0];

  public style; // тег style который добавиться в head
  public styleId = 'gmp_css_' + this._generateGuid(); // id тега style
  public styleStart = true; // для того чтобы не создавать теги style при каждом создание класса стиля

  public isLocalhost = window.location.hostname === 'localhost'; // режим разработки

  /*
  * Функция создает тег style ("при первом входе") и добавляет в тег классы стилей
  * @param className - string - наименование нового класса без точкой впереди!!!
  * начала названия класса - gmp_css-'- обязательно !!!
  * @param rules - string_овый объект
  * ПРИМЕР - createClass('gmp_css-1', '{ color: red; }');
  */
  public createCssClass(className, rules) {
    if (!this._gmpCheckName('class', className)) {
      return;
    }

    if (!this.style) {
      this.style = document.createElement('style');
      this.style.id = this.styleId;
    }

    // При первом и повторных вызовах функции новые классы добавляются к стилям в gmp_css_<guid>
    this.style.innerHTML = this.style.innerHTML ?
      this.style.innerHTML + ` .${className} ${rules}`
      : `.${className} ${rules}`;

    if (this.styleStart) {
      // Только при первом заходе в 'head' добавляются GMP стили ('gmp_css-<guid>')
      this.head.appendChild(this.style);
      this.styleStart = false;
    }
  }

  /*
  * Функция добавляет класс к элементу по его data атрибуту и его значению (<div data-gmp_css='gmp_css_1'>ПРИМЕР</div>)
  * @param className - string - наименование нового класса без точкой впереди
  * @param elementToSelect - HTMLElement/string (!!!data атрибут 'data-gmp_css')
  * если для elementToSelect пришел string - то 'data-gmp_css' ОБЯЗАТЕЛЬНО
  * @param dataValue - например 'gmp_css_1'
  * dataValue - ОБЯЗАТЕЛЬНО начинается с 'gmp_css_'
  * @param doRemove - нужно ли удаление
  *  ПРИМЕР - applyClass(gmp_css-1', 'data-gmp_css', 'gmp_css_1');
  */
  public applyCssClass(className, elementToSelect, dataValue = null, doRemove = null) {
    if (!elementToSelect) {
      return;
    }
    if (!this._gmpCheckName('class', className)) {
      return;
    }

    let element = null;

    if (typeof elementToSelect.valueOf() === 'string') {
      if (!this._gmpCheckName('data', elementToSelect, dataValue)) {
        return;
      }
      const selector = `[${elementToSelect}=${dataValue}]`;

      element = document.querySelector(selector);
    } else {
      element = elementToSelect;
    }

    if (element) {
      if (doRemove) {
        element.className = element.className.split(' ').filter(item => item !== className).toString();
      } else {
        element.className = element.className ? element.className + ' ' + className : className;
      }

      this._gmpInfo(document.getElementsByTagName('head')[0]);
    }
  }

  /*
  * Функция создает и добавляет класс к элементу по его data атрибуту и его значению (<div data-gmp_css='gmp_css_1'>ПРИМЕР</div>)
  * @param className - string - наименование нового класса с точкой впереди
  * @param rules - string - объект
  * @param elementToSelect - HTMLElement/string (!!!data атрибут 'data-gmp_css')
  * если для elementToSelect пришел string - то 'data-gmp_css' ОБЯЗАТЕЛЬНО
  * @param dataValue - например 'gmp_css_1'
  * dataValue - ОБЯЗАТЕЛЬНО начинается с 'gmp_css_'
  * ПРИМЕРЫ
  * this.createApplyCssClass('gmp_css-1', '{ width: 50%; height: 500px;}', 'data-gmp_css', 'gmp_css_1');
  * this.createApplyCssClass('gmp_css-2', '{ color: blue; }', 'data-gmp_css', 'gmp_css_1');
  */
  public createApplyCssClass(className, rules, elementToSelect, dataValue) {
    this.createCssClass(className, rules);

    if (typeof elementToSelect.valueOf() === 'string') {
      this.applyCssClass(className, elementToSelect, dataValue);
    } else {
      this.applyCssClass(className, elementToSelect, null);
    }
  }

  /*
  * Функция удаляет класс у элемента по его data атрибуту и его значению (<div data-gmp_css='gmp_css_1'>ПРИМЕР</div>)
  * @param className - string - наименование нового класса с точкой впереди
  * @param elementToSelect - HTMLElement/string (!!!data атрибут 'data-gmp_css')
  * если для elementToSelect пришел string - то 'data-gmp_css' ОБЯЗАТЕЛЬНО
  * @param dataValue - например 'gmp_css_1'
  * dataValue - ОБЯЗАТЕЛЬНО начинается с 'gmp_css_'
  * ПРИМЕРЫ
  * this.removeCssClass('gmp_css-1', 'data-gmp_css', 'gmp_css_1');
  */
  public removeCssClass(className, elementToSelect, dataValue) {
    if (typeof elementToSelect.valueOf() === 'string') {
      this.applyCssClass(className, elementToSelect, dataValue, true);
    } else {
      this.applyCssClass(className, elementToSelect, null, true);
    }
  }

  /* Функция удаляет созданный в createCssClass тег style */
  public removeElementStyle(): void {
    this.style.parentNode.removeChild(this.style);
  }

  /* Функция удаляет тег style по id */
  public removeElementStyleById(id = ''): void {
    this.head.querySelector('#' + id).parentNode.removeChild(this.style);
  }

  /*
  * Для унификации нейминга!!!
  * @param param - 'class' | 'data'
  * @param name
  * - если param === 'class' - наименование класса (начинаться с 'gmp_css-')
  * или
  * - если param === 'data' (должен наименоваться 'data-gmp_css')
  * @param value - если param === 'class'- может не быть или если param === 'data' (должен начинаться с 'gmp_css_')
  */
  private _gmpCheckName(param: 'class' | 'data', name: string, value = null): boolean {
    if (param === 'class') {
      const resultName = name.startsWith('gmp_css-');

      if (!resultName) {
        this._gmpErrorInfo('---Наименование класса должно начинаться с "gmp_css-"');
      }

      return resultName;
    }
    if (param === 'data') {
      const resultParam = name === 'data-gmp_css';
      const resultValue = value.startsWith('gmp_css_');

      if (!resultParam) {
        this._gmpErrorInfo('---Наименование data параметра должно быть "data-gmp_css"');
      }
      if (!resultValue) {
        this._gmpErrorInfo('---Наименование значения data параметра должно начинаться с "gmp_css_"');
      }

      return resultParam && resultValue;
    }

    return false;
  }

  /* Что бы часто console.log не светить */
  private _gmpInfo(info): void {
    if (this.isLocalhost) {
      // tslint:disable-next-line:no-console
      console.log('===========', info);
    }
  }

  /* Ошибка в коде */
  private _gmpErrorInfo(text: string): void {
    throw new Error(text);
  }

  /* Создать новый guid */
  private _generateGuid(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

}
