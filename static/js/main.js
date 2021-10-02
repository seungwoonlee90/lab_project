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
    const apiKey = document.getElementById('apiKey').value;
    api_call(apiKey);
});

function api_call(apiKey) {
    for(k = 1 ; k < 6 ; k++) {
        let url = `http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dubobsif?&basin=${k}&oper=y&output=json&key=${apiKey}`

        axios.request({
            method: 'GET',
            url: url,
            headers: {'Content-Type': 'application/json'},
            type: 'json'
        })
        .then(function(res) {

            for(i = 0 ; i < res.data.count ; i ++) {
                let obscd = res.data.list[i].obscd;
                let obsnm = res.data.list[i].obsnm;
                let url = `http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dtdata?obscd=${obscd}&year=2021&output=json&key=${apiKey}`

                axios.request({
                    method: 'GET',
                    url: url,
                    headers: {'Content-Type': 'application/json'},
                    type:'json'
                }).then(function(response) {
                    let data = response.data.list[response.data.list.length - 2]
                    const effi = document.getElementById('ef').value;
                    if(!data) {
                        let ymd_ = document.createElement('span')
                        let obscd_ = document.createElement('span')
                        let obsnm_ = document.createElement('span')
                        let fw_ = document.createElement('span')
                        let power_ = document.createElement('span')

                        ymd_.innerHTML = -999;
                        obscd_.innerHTML = obscd;
                        obsnm_.innerHTML = obsnm;
                        fw_.innerHTML = -999;
                        power_.innerHTML = -999;
                        
                        section.appendChild(ymd_);
                        section.appendChild(obscd_);
                        section.append(obsnm_)
                        section.appendChild(fw_);
                        section.appendChild(power_)

                        ymd_.style.color = "red"
                        obscd_.style.color = "red"
                        obsnm_.style.color = "red"
                        fw_.style.color = "red"
                        power_.style.color = "red"

                    } else {

                        let ymd_ = document.createElement('span')
                        let obscd_ = document.createElement('span')
                        let obsnm_ = document.createElement('span')
                        let fw_ = document.createElement('span')
                        let power_ = document.createElement('span')
    
                        let fw = data.fw.replace(/-/gi, '-999')
                        if(fw>0 & fw<1) {
                            fw = `0${fw}`
                        }

                        let ymd = data.ymd

                        ymd_.innerHTML = ymd;
                        obscd_.innerHTML = obscd;
                        obsnm_.innerHTML = obsnm;
                        fw_.innerHTML = fw;
    
                        if(fw < 0) {
                            power_.innerHTML = -999;
                            ymd_.style.color = "red"
                            obscd_.style.color = "red"
                            obsnm_.style.color = "red"
                            fw_.style.color = 'red';
                            power_.style.color = 'red';
                        } else {
                            power_.innerHTML = Math.round(9.8 * fw * 1.5 * effi)
                        }
                        
                        section.appendChild(ymd_);
                        section.appendChild(obscd_);
                        section.append(obsnm_)
                        section.appendChild(fw_);
                        section.appendChild(power_)
                    }
                })
    
            }
        }
        )
    }
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