let table_body = document.getElementById('t_body');
let fo_filter = document.getElementById('fo_filter');
let month_filter = document.getElementById('month_filter');

fetch('/getDefault').then(answer =>{
    answer.json().then(result=>{
        table_body.innerHTML = generateTableBody(result.table);
        createFilterFields(result.fo, result.fo_id, result.month);
    })
});

function generateTableBody(table){
    let html = '';
    let cell_order = [{key: 't_name', class: 'td__text'}, {key: 'h_name', class: 'td__text'},
     {key: 'd_name', class: 'td__text'}, {key: 'patients', class: 'td__num'}, {key: 'issued', class: 'td__num'}];
    for (let item of table){
        let tendency = item.issued - item.patients;
        html += '<tr'
        html += '>';
        for (let order of cell_order){
            html += '<td class="' + order.class + '">' + item[order.key] + '</td>';
        }

        let ten_class = 'class="td__num';
        if (tendency > 0){
            ten_class += ' positive';
        }
        else if (tendency < 0){
            ten_class += ' negative';
        }
        html += '<td ' + ten_class + '">' + tendency + '</td></tr>';
    }
    return html;
}

function createFilterFields(fo_list, cur_fo, cur_month){
    let select_html = '';
    for (let key in fo_list){
        select_html += '<option value = "' + key + '"';
        select_html += (key == cur_fo) ? ' selected>' : '>';
        select_html += fo_list[key] + '</option>';
    }
    fo_filter.innerHTML = select_html;
    select_html = '';
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    cur_month = Number(cur_month) - 1;
    for(let i=0; i<months.length; i++){
        select_html += '<option value = "' + (i+1) + '"';
        select_html += (i == cur_month) ? ' selected>' : '>';
        select_html += months[i] + '</option>';
    }
    month_filter.innerHTML = select_html;
}

function updateTable(){
    const data = {fo: fo_filter.value, month: month_filter.value};
    fetch('/updTable', {method: 'POST', body: JSON.stringify(data)}).then(answer => {
        answer.json().then(result=>{
            table_body.innerHTML = generateTableBody(result);
        })
    });
}