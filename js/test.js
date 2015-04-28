
/**
 * Created by stevenchu_sj on 4/15/15.
 */

function createMonthArray() {
    // create the month array according to the dates
    var month = [];
    // get the current date
    var curr_date = new Date();
    // get the first day of this month
    var first_day = (new Date(curr_date.getFullYear(), curr_date.getMonth(), 1)).getDay();

    // get the last date
    var curr_last_date = new Date(curr_date.getFullYear(), curr_date.getMonth() + 1, 0);
    // get the last day
    var curr_last_day = curr_last_date.getDay();

    print('curr_date', 'first_day', 'curr_last_date', 'curr_last_day');

    // get the remaining dates of the last month
    var prev_last_date = (new Date(curr_date.getFullYear(), curr_date.getMonth(), 0)).getDate();
    console.log("prev_last_date: " + prev_last_date);
    for (var i = 0, len = 6 - first_day; i < len; i++) {
        //month.unshift(prev_last_date - i);
        month.unshift(new CustomDate(prev_last_date - i, 0));
    }
    console.log(month);

    // add dates for the current month
    for (i = 1, len = curr_last_date.getDate(); i <= len; i++) {
        //month.push(i);
        month.push(new CustomDate(i, 1));
    }
    console.log(month);

    // get the remaining dates of the next month
    for (i = 0, len = 6 - curr_last_day; i < len; i++) {
        //month.push(i + 1);
        month.push(new CustomDate(i + 1, 2));
    }
    console.log(month);

    // return the month


    function print() {
        Array.prototype.slice.call(arguments).forEach(function (arg) {
            console.log(arg + ':' + eval(arg));

        });
    }

    displayMonthCalendar(month);

}

function createElement(elementType, parent, innerHtml, custom) {
    var element = document.createElement(elementType);

    if ( parent ) { parent.appendChild(element); }

    if ( innerHtml ) { element.innerHTML = innerHtml; }

    if ( typeof custom !== 'undefined' ) {
        for ( var prop in custom ) {
            element.setAttribute( prop, custom[prop] );
        }
    }

    return element;
}

function displayMonthCalendar(month) {
    var divMonth = document.querySelector('div.dates');

    month.forEach(function(day) {
        var className;
        switch (day.month_type) {
            case 0: className = 'date prev-month';
                break;
            case 1: className = 'date';
                break;
            case 2: className = 'date next-month';
                break;
        }
        var div = createElement('div', divMonth, day.date);
        div.className = className;
    })
}

function CustomDate(date, monthType) {
    this.date = date;
    this.month_type = monthType; // 0 --> prev, 1--> curr, 2 --> next
}

createMonthArray();

function populateDatesContainer(container) {
    // populate the container with dates ...
    var month = createMonthArray();

    container.innerHTML = '';
    month.forEach(function (day) {
        var className;
        switch (day.month_type) {
            case 0: className = 'date prev-month';
                break;
            case 1: className = 'date';
                break;
            case 2: className = 'date next-month';
                break;
        }

        createElement('div', container, className, day.date);
    });
}
