
function dayToString( index ) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[index];
}

function monthToString( index ) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    return months[index];
}

function utcIdToString( id ) {
    var date = new Date(parseInt( id ));

    var str = dayToString( date.getDay() );
    str += ' ' + monthToString( date.getMonth() );
    str += ' ' + date.getDate() + ', ' + date.getFullYear();

    return str;
}

function timeToString(hr, mn) {
    var str = ( hr < 10 ) ? "0" + hr : hr;

    str += ":";

    str += (mn < 10) ? "0" + mn : mn;

    return str;
}

function CustomDate(id, date, monthType) {
    /* 0 = previous month, 1 = current month, 2 = next month */
    this.id = id;
    this.date = date;
    this.monthType = monthType;
}

function Task() {
    this.id = null;
    this.start = null;
    this.end = null;
    this.note = null;
}

function Calendar() {
    this.tasks = [];
    this.loadingTaskId = null;
    this.task = new Task();

    this.currentUTC = +( new Date() );

    //var date = new Date(this.currentUTC);
    //console.log(date.getMonth(), date.getFullYear(), date.getDate(), date.getDay());
}

Calendar.prototype.createElement = function(elementType, parent, innerHtml, custom) {
    var element = document.createElement(elementType);

    if ( parent ) { parent.appendChild(element); }

    if ( innerHtml ) { element.innerHTML = innerHtml; }

    if ( typeof custom !== 'undefined' ) {
        for ( var prop in custom ) {
            element.setAttribute( prop, custom[prop] );
        }
    }

    return element;
};

Calendar.prototype.createMonthCalendar =  function(utc) {

    // Create array month according to the dates
    var months = [];

    // Get current date
    var now = new Date(utc);

    // Get current month last date
    var lastDate = new Date( now.getFullYear(), now.getMonth() + 1, 0);
    //console.log("lastDate: " + lastDate + " => Day of Week: " + lastDate.getDay());

    // 0 for Sunday - 6 for Saturday
    // Get the day of the week for first and last date of the month
    var firstDayOfWeek = ( new Date(now.getFullYear(), now.getMonth(), 1)).getDay();

    // Get the last date of previous month
    var prevLastDate = (new Date(now.getFullYear(), now.getMonth(), 0)).getDate();

    // Add dates from previous month
    for ( var i = 0, len = firstDayOfWeek; i < len; i++ ) {

        var d = prevLastDate - i;

        // using UTC(year, month, day) to create ID
        var utcID = +(new Date( now.getFullYear(), now.getMonth() - 1, d ));
        months.unshift( new CustomDate(utcID, d, 0) );
    }

    // Add dates from current month
    for ( i = 1, len = lastDate.getDate(); i <= len ; i++ ) {

        utcID = +(new Date( now.getFullYear(), now.getMonth(), i ));
        months.push( new CustomDate(utcID, i, 1) );
    }

    // 7 days / week * 6 weeks calendar = 42
    len = 42 - months.length;
    for ( i = 0; i < len; i++ ) {

        utcID = +(new Date( now.getFullYear(), now.getMonth() + 1, i + 1 ));
        months.push( new CustomDate(utcID, i + 1, 2) );
    }

    return months;
};

Calendar.prototype.loadMonthCalendar = function(month) {
    var date = new Date(this.currentUTC);

    var title = document.querySelector('div.calendar-title');
    title.innerHTML = monthToString(date.getMonth()) + ' ' + date.getFullYear();

    var parent = document.querySelector('div.dates');
    while ( parent.firstChild ) { parent.removeChild(parent.firstChild); }

    var className;
    var savedThis = this;
    month.forEach( function(day) {
        switch( day.monthType ) {
            case 0:
                className = 'date prev-month';
                break;
            case 1:
                className = 'date current';
                break;
            case 2:
                className = 'date next-month';
                break;
        }

        var div = savedThis.createElement('div', parent, day.date );
        div.className = className;
        div.setAttribute('id', day.id);
    });
};

Calendar.prototype.loadTaskUI = function( str ) {
    var section = document.querySelector('section.task-ui-form');

    var element = this.createElement('div', section);
    element.innerHTML =  'When: ' + utcIdToString( this.loadingTaskId ) + ' @ ' + str;

    element = this.createElement('input', section);
    element.setAttribute('placeholder', "e.g., Win the superbowl" );
    element.setAttribute('type', 'text');
    element.setAttribute('name', 'task-note');

    var wrapper = this.createElement('div', section);
    element = this.createElement('div', wrapper, 'create');
    element.setAttribute('id', 'task-create');

    element = this.createElement('div', wrapper, 'cancel');
    element.id = 'task-cancel';

    section.style.display = 'block';

    this.onLoadTaskUI();
};

// Register Event Listener for create and cancel when Task UI is loading
Calendar.prototype.onLoadTaskUI = function() {
    var section = document.querySelector('section.task-ui-form');
    var savedThis = this;

    document.querySelector('div#task-create').addEventListener('click', function() {
        savedThis.task.note = section.querySelector("input[name='task-note']").value;
        savedThis.saveTask();
        savedThis.unloadTaskUI();
        savedThis.unsetTimeSelection();
    });

    document.querySelector('div#task-cancel').addEventListener('click', function(e) {
        savedThis.unloadTaskUI();
        savedThis.resetTask();
        savedThis.unsetTimeSelection();
    });
};

Calendar.prototype.unloadTaskUI = function() {
    var section = document.querySelector('section.task-ui-form');

    while ( section.firstChild ) { section.removeChild(section.firstChild); }

    section.style.display = 'none';
};

Calendar.prototype.loadDateTasks = function(id) {
    var section = document.querySelector('section.calendar-tasks');

    while ( section.firstChild ) { section.removeChild(section.firstChild); }

    this.createElement('h1', section, 'Task of ' + utcIdToString(id) );

    // a block of 30 minutes for 24 hours/day = 48 blocks
    for ( var i = 0; i < 48; i++ ) {

        var div = this.createElement('div', section);
        div.className = "time-stamp";

        var task = this.createElement('div', section, '&nbsp;');
        task.className = "time-task";

        // starting
        var min = i * 30;
        var hr = Math.floor(min / 60);
        var mn = min % 60;

        div.innerHTML = timeToString(hr, mn);
        div.innerHTML += " - ";

        // ending
        min = (i + 1) * 30;
        hr = Math.floor(min / 60);
        mn = min % 60;

        div.innerHTML += timeToString(hr, mn);

        div.setAttribute('data-timestamp', i.toString(10));
        task.setAttribute('data-timestamp', i.toString(10));
    }

    this.onLoadDateTasks(id);
};

Calendar.prototype.onLoadDateTasks = function(id) {
    for ( var i = 0, len = this.tasks.length; i < len; i++ ) {
        if ( this.tasks[i].id == id ) {
            this.disabledBlock(parseInt(this.tasks[i].start), parseInt(this.tasks[i].end), this.tasks[i].note);
        }
    }
};

Calendar.prototype.setTimeSelection = function (target) {
    target.classList.add('selected');

    if ( target.classList.contains('time-stamp')) { target.nextSibling.classList.add('selected'); }
    else { target.previousSibling.classList.add('selected'); }
};

Calendar.prototype.unsetTimeSelection = function() {

    var divs = document.querySelector('section.calendar-tasks').querySelectorAll('div.selected');

    for ( var i = 0, len = divs.length; i < len; i++ ) {
        divs[i].classList.remove('selected');
    }
};

Calendar.prototype.saveTask = function() {
    var task = new Task();

    task.id = this.task.id;
    task.start = this.task.start;
    task.end = this.task.end;
    task.note = this.task.note;

    this.tasks.push(task);
    this.disabledBlock(this.task.start, this.task.end, this.task.note);
    this.resetTask();
};

Calendar.prototype.resetTask = function() {
    this.task.start = null;
    this.task.end = null;
    this.task.note = ''
};

Calendar.prototype.disabledBlock = function(start, end, note) {

    var section = document.querySelector('section.calendar-tasks');
    var nodes = section.querySelectorAll('div.time-task');

    for ( var i = start; i <= end; i++ ) {
        nodes[i].classList.add('unavailable');
        nodes[i].previousSibling.classList.add('unavailable');
    }

    var div = this.createElement('div', section);
    div.className = 'unavailable-time';

    div.style.top    = nodes[start].offsetTop + 'px';
    div.style.left   = nodes[start].offsetLeft + 'px';
    div.style.width  = nodes[start].offsetWidth + 'px';
    div.style.height = nodes[end].offsetTop - nodes[start].offsetTop + nodes[end].offsetHeight + 'px';

    div.innerHTML = note;
};

Calendar.prototype.timeBlocksToString = function(start, end) {

    var startHour = Math.floor( start / 2 );
    var startMin = ( start % 2 == 0 ) ? 0 : 30;

    // Add 30 minutes
    var endHour = Math.ceil(end / 2);
    var endMin = ( end % 2 == 1 ) ? 0 : 30;

    var str = timeToString(startHour, startMin) + ' - ' + timeToString(endHour, endMin);

    return str;
};

Calendar.prototype.validateSelection = function(start, end) {
    var section = document.querySelector('section.calendar-tasks');
    var divs = section.querySelectorAll('div.time-stamp');

    for ( var i = start; i <= end; i++ ) {
        if (divs[i].classList.contains('unavailable'))
            return false;
    }

    return true;
};

Calendar.prototype.getPreviousMonth = function() {
    var current = new Date(this.currentUTC);
    /*
    var date1 = new Date(current.getFullYear(), current.getMonth(), 0);
    var date2 = new Date(current.getFullYear(), current.getMonth() + 1, 1);

    console.log(monthToString(date1.getMonth()), date1.getFullYear());
    console.log(monthToString(date2.getMonth()), date2.getFullYear());
    */

    this.currentUTC =  +(new Date(current.getFullYear(), current.getMonth(), 0));
    var month = this.createMonthCalendar(this.currentUTC);
    this.loadMonthCalendar(month);
};

Calendar.prototype.getNextMonth = function() {
    var current = new Date(this.currentUTC);
    this.currentUTC = +(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    var month = this.createMonthCalendar(this.currentUTC);
    this.loadMonthCalendar(month);
};

Calendar.prototype.validateTime = function() {

    if ( parseInt(this.task.start) > parseInt(this.task.end) ) {
        var start = this.task.start;

        console.log('inside');

        this.task.start = this.task.end;
        this.task.end = start;
    }

};

(function() {
    var calendar = new Calendar();
    var month = calendar.createMonthCalendar(calendar.currentUTC);
    calendar.loadMonthCalendar(month);

    document.querySelector('div.dates').addEventListener('click', function(e) {

        var target = e.target;

        //if ( target.classList.contains('prev-month') ) { return; }

        var div = document.querySelector('div.date.selected');
        if ( div ) { div.classList.remove('selected'); }

        target.classList.add('selected');

        calendar.loadingTaskId = target.id;
        calendar.unloadTaskUI();
        calendar.loadDateTasks(calendar.loadingTaskId);
    });

    function onMouseOverHandler(event) {
        var target = event.target;

        calendar.setTimeSelection(target);
    }

    var section = document.querySelector('section.calendar-tasks');
    section.addEventListener('mousedown', function(e) {

        var target = e.target;

        calendar.unloadTaskUI();
        calendar.setTimeSelection(target);

        calendar.task.id = calendar.loadingTaskId;
        calendar.task.start = target.getAttribute('data-timestamp');

        section.addEventListener('mouseover', onMouseOverHandler)
    });

    section.addEventListener('mouseup', function(e) {

        var target = e.target;

        if ( target.classList.contains('unavailable') || target.classList.contains('unavailable-time') )
            return;

        calendar.task.end = target.getAttribute('data-timestamp');

        calendar.validateTime();

        if ( !calendar.validateSelection(parseInt(calendar.task.start), parseInt(calendar.task.end)) ) {
            calendar.resetTask();
            calendar.unsetTimeSelection();

            return;
        }

        calendar.loadTaskUI(calendar.timeBlocksToString(calendar.task.start, calendar.task.end));

        section.removeEventListener( 'mouseover', onMouseOverHandler );
    });

    document.querySelector('div#prev-month').addEventListener('click', function() {
        calendar.getPreviousMonth();
    });

    document.querySelector('div#next-month').addEventListener('click', function() {
        calendar.getNextMonth();
    });

}());

