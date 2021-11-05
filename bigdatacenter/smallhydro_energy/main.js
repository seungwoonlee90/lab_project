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
           url :'https://raw.githubusercontent.com/seungwoonlee90/lab_project/master/bigdatacenter/smallhydro_energy/smallhydro.json',
           headers: {'Content-Type': 'application/json'},
           type : 'json'
        })
       .then((response) => {
        let data = new Array(response.data);
        const effi = document.getElementById('ef').value;
        console.log(data[0][0])

        for (let i = 0; i < 802; i+=1) {
            let ymd = data[0][i]['ymd'];
            let sbsncd = data[0][i]['sbsncd'];
            let obscd =  data[0][i]['obscd'];
            let obsnm = data[0][i]['obsnm'];
            let fw = data[0][i]['fw'];
            let pw = fw * 9.8 * effi * 1.5;

            if (pw < 0 ) {
                pw = '-999';
            }

            let ymd_ = document.createElement('span')
            let sbsncd_ = document.createElement('span')
            let obscd_ = document.createElement('span')
            let obsnm_ = document.createElement('span')
            let fw_ = document.createElement('span')
            let pw_ = document.createElement('span')

            ymd_.innerHTML = ymd
            sbsncd_.innerHTML = sbsncd
            obscd_.innerHTML = obscd
            obsnm_.innerHTML = obsnm
            fw_.innerHTML = fw
            pw_.innerHTML = Math.round(pw)

            section.appendChild(ymd_);
            section.appendChild(sbsncd_);
            section.appendChild(obscd_);
            section.appendChild(obsnm_);
            section.appendChild(fw_);
            section.appendChild(pw_);
        }

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

    for (let i = 0; i < rows.length; i+=6) {

        let ymd = rows[i].innerHTML;
        let sbsncd = rows[i+1].innerHTML;
        let obscd = rows[i+2].innerHTML;
        let obsnm = rows[i+3].innerHTML;
        let q = rows[i+4].innerHTML;
        let power = rows[i+5].innerHTML;

        array = {ymd, sbsncd, obscd, obsnm, q, power}
        datas.push(array);
    }


    let df = new dfd.DataFrame(datas)

    df.to_csv().then((csv) => {
        console.log(csv);
    }).catch((err) => {
        console.log(err);
    })
}