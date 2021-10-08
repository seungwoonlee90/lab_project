let start = document.getElementById('start');
let fw = document.querySelectorAll('span');
let datetime = document.getElementById('datetime');
let section = document.querySelector('section');
let date = new Date().toLocaleDateString()

window.onload = function(){
    datetime.innerText = `기준일 : ${date}`
}

start.addEventListener('click', function(event) {
    event.preventDefault();
    api_call();
});

function api_call() {
       axios.request({
           url :'https://raw.githubusercontent.com/seungwoonlee90/lab_project/master/bigdatacenter/smallhydro_energy/samllhydro.json',
           headers: {'Content-Type': 'application/json'},
           type : 'json'
        })
       .then((response) => {
        let data = response.data;
        const effi = document.getElementById('ef').value;
        console.log(typeof(data), data, effi)
       })
}

let download = document.getElementById('download');
download.addEventListener('click', function(e){
    e.preventDefault();
    saveCSV();
})

//edit here
function saveCSV(){
    let rows = document.querySelectorAll("span");
    let datas = [];
    let array = {};

    for (let i = 0; i < rows.length; i+=5) {

        let ymd = rows[i].innerHTML;
        let obscd = rows[i+1].innerHTML;
        let fw = rows[i+3].innerHTML;
        let power = rows[i+4].innerHTML;

        array = {ymd, obscd, fw, power}
        datas.push(array);
    }


    let df = new dfd.DataFrame(datas)

    df.to_csv().then((csv) => {
        console.log(csv);
    }).catch((err) => {
        console.log(err);
    })
}