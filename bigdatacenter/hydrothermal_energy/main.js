window.onload = function() {
    axios.get('https://raw.githubusercontent.com/seungwoonlee90/toy_project/master/hydrothermal_energy/hydrothermal.json')
    .then(function(res){
        console.log(res.data)
    })
}