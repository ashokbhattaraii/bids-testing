import { Modal, Form, Session } from "rumsan-ui";
import Service from "./service";
import config from "../config";

class RequestChart extends Modal {
  constructor(cfg) {
    super(cfg);
    this.registerEvents("chart-load-by-date", "total-request-load-by-date");
    this.loadCharts();
    this.loadTotalRequestByDate();

    this.on("chart-load-by-date", (err, data) => {
      this.loadCharts();
    });

    this.on("total-request-load-by-date", (err, data) => {
      this.loadTotalRequestByDate();
    });
  }

  async loadTotalRequestByDate() {
    let date = $("#dateTotalRequest").val();
    if(!date && date.length === 0){
      date = moment(moment().toString()).format('YYYY-MM-DD');
    }
    $('#dateTotalRequest').val(date);    
    let data = await Service.getRequestListByDate(date);
    $("#totalRequest").html(data.length == 0? 0 : data[0].total);
  }

  async loadCharts() {
    let from_date = $("#from_date").val();
    let to_date = $("#to_date").val();

    if (from_date && to_date) {
      $("#weekly-monthly-chart").attr("style", "display:none;");
      this.loadChartByDates(from_date, to_date);
      $("#chart-by-dates").removeAttr("style");
    } else {
      $("#chart-by-date").attr("style", "display:none;");
      this.loadweeklyChart();
      this.loadmonthlyChart();
      $("#weekly-monthly-chart").removeAttr("style");
    }
  }

  async loadChartByDates(from_date, to_date) {   
    to_date = moment(moment(to_date).endOf('day').toString()).format('YYYY-MM-DD HH:mm:ss');    
    let resData = await Service.getChartRequestDetailsByDates(from_date, to_date);
    to_date = moment(to_date).format('YYYY-MM-DD');
    $("#totalRequest").html(resData.data.length);
    this.requestReceivedFromChart(
      resData,
      "requestReceivedFromDoughnutChartByDates",
      "requestReceivedFromByDatesDownloadPNG"
    );
    $("#reqReceivedFromByDates").html(`Request Received From ( ${from_date} - ${to_date} )`);
    this.requestManagedFromChart(
      resData,
      "requestManagedFromDoughnutChartByDates",
      "requestManagedFromByDatesDownloadPNG"
    );
    $("#reqManagedFromByDates").html(`Request Managed From ( ${from_date} - ${to_date} )`);

    this.requestByBloodGroupChart(
      resData,
      "requestByBloodGroupDoughnutChartByDates",
      "requestByBLoodByDatesDownloadPNG"
    );
    $("#reqByBloodGroupByDates").html(`Request By Blood Group ( ${from_date} - ${to_date} )`);

    this.requestByDiagnosisChart(
      resData,
      "requestByDiagnosisDoughnutChartByDates",
      "requestByDiagnosisByDatesDownloadPNG"
    );
    $("#reqByDiagnosisGroupByDates").html(`Request By Diagnosis ( ${from_date} - ${to_date} )`);
  }

  async loadweeklyChart() {
    const weekStart =moment(moment().startOf('week').toString()).format('YYYY-MM-DD');    
    const weekEnd = moment(moment().endOf('week').endOf('day').toString()).format('YYYY-MM-DD HH:mm:ss');            
    let resData = await Service.getChartRequestDetailsByDates(weekStart,weekEnd);
    this.requestReceivedFromChart(
      resData,
      "weeklyrequestReceivedFromDoughnutChart",
      "requestReceivedFromWeeklyDownloadPNG"
    );
    this.requestManagedFromChart(
      resData,
      "weeklyrequestManagedFromDoughnutChart",
      "requestManagedFromWeeklyDownloadPNG"
    );
    this.requestByBloodGroupChart(
      resData,
      "weeklyrequestByBloodGroupDoughnutChart",
      "requestByBLoodWeeklyDownloadPNG"
    );
    this.requestByDiagnosisChart(
      resData,
      "weeklyrequestByDiagnosisDoughnutChart",
      "requestByDiagnosisWeeklyDownloadPNG"
    );
  }

  async loadmonthlyChart() {
    const monthStart =moment(moment().startOf('month').toString()).format('YYYY-MM-DD');    
    const monthEnd = moment(moment().endOf('month').endOf('day').toString()).format('YYYY-MM-DD HH:mm:ss');     
    let resData = await Service.getChartRequestDetailsByDates(monthStart, monthEnd);
    this.requestReceivedFromChart(
      resData,
      "monthlyrequestReceivedFromDoughnutChart",
      "requestReceivedFromMonthlyDownloadPNG"
    );
    this.requestManagedFromChart(
      resData,
      "monthlyrequestManagedFromDoughnutChart",
      "requestManagedFromMonthlyDownloadPNG"
    );
    this.requestByBloodGroupChart(
      resData,
      "monthlyrequestByBloodGroupDoughnutChart",
      "requestByBLoodMonthlyDownloadPNG"
    );
    this.requestByDiagnosisChart(
      resData,
      "monthlyrequestByDiagnosisDoughnutChart",
      "requestByDiagnosisMonthlyDownloadPNG"
    );
  }

  showLabelWithoutHover() {
    Chart.pluginService.register({
      beforeRender: function (chart) {
        if (chart.config.options.showAllTooltips) {
          // create an array of tooltips
          // we can't use the chart tooltip because there is only one tooltip per chart
          chart.pluginTooltips = [];
          chart.config.data.datasets.forEach(function (dataset, i) {
            chart.getDatasetMeta(i).data.forEach(function (sector, j) {
              chart.pluginTooltips.push(
                new Chart.Tooltip(
                  {
                    _chart: chart.chart,
                    _chartInstance: chart,
                    _data: chart.data,
                    _options: chart.options.tooltips,
                    _active: [sector]
                  },
                  chart
                )
              );
            });
          });

          // turn off normal tooltips
          chart.options.tooltips.enabled = false;
        }
      },
      afterDraw: function (chart, easing) {
        if (chart.config.options.showAllTooltips) {
          // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
          if (!chart.allTooltipsOnce) {
            if (easing !== 1) return;
            chart.allTooltipsOnce = true;
          }

          // turn on tooltips
          chart.options.tooltips.enabled = true;
          Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
            tooltip.initialize();
            tooltip.update();
            // we don't actually need this since we are not animating tooltips
            tooltip.pivot();
            tooltip.transition(easing).draw();
          });
          chart.options.tooltips.enabled = false;
        }
      }
    });
  }

  async requestReceivedFromChart(payload, id, downloadId) {
    let data = await payload;
    data.data[0].requestReferredBy.sort((a, b) => (a.name > b.name) ? 1 : -1);    
    let obj = data.data[0].requestReferredBy;
    let labels =[];  
    let refData = [];     
    obj.forEach(el=>{       
        for(const prop in el){
          if( prop === 'name'){
            labels.push( el[prop] );
          }
          else if ( prop === 'total'){
            refData.push( el[prop] );
          }
        }
    }); 

    var doughnutData = {
      labels,
      datasets: [
        {
          data: refData,
          backgroundColor: ["#a3e1d4", "#4267B2", "#e95950",'#898F9C','#665CDF','#FF0000','#25D366']
        }
      ]
    }; 

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      }, 
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },    
      tooltips: {
        enabled: true,
        bodyFontSize: 15,
        bodyFontColor: "#fff",
        backgroundColor: "rgba(0,0,0,0.4)"
      }  
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "doughnut",
      data: doughnutData,
      options: doughnutOptions
    });
  }

  async requestManagedFromChart(payload, id, downloadId) {
    let data = await payload;    
    let obj = data.data[0].requestManagedFrom;
    let labels =[];  
    let managedFromData = [];     
    obj.forEach(el=>{       
        for(const prop in el){
          if( prop === 'name'){
            labels.push( el[prop] );
          }
          else if ( prop === 'total'){
            managedFromData.push( el[prop] );
          }
        }
    });    
    
    var doughnutData = {
      labels,
      datasets: [
        {
          data: managedFromData,
          backgroundColor: ["#ffd1dc", "#b19cd9", "#1ca9c9", "#addfad", "#c0c0c0"]
        }
      ]
    };

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },      
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: true,
        bodyFontSize: 18,
        bodyFontColor: "#fff",
        backgroundColor: "rgba(0,0,0,0.4)",        
      }
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "doughnut",
      data: doughnutData,
      options: doughnutOptions
    });
  }

  async requestByBloodGroupChart(payload,id, downloadId){
    let data = await payload;    
    let obj = data.data[0].requestByBloodGroup;
    let labels =[];  
    let bloodData = [];     
    obj.forEach(el=>{       
        for(const prop in el){
          if( prop === 'name'){
            labels.push( el[prop] );
          }
          else if ( prop === 'total'){
            bloodData.push( el[prop] );
          }
        }
    });    

    var doughnutData = {
      labels,
      datasets: [
        {
          data: bloodData,
          backgroundColor: ['#ffd70f',"#ff8c00","#00188f", "#00bcf2","#e81123",  "#00b294","#ec008c", "#009e49",'#bad80a','#68217a']
        }
      ]
    };  

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },     
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: true,
        bodyFontSize: 18,
        bodyFontColor: "#fff",
        backgroundColor: "rgba(0,0,0,0.4)",  
      }
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "doughnut",
      data: doughnutData,
      options: doughnutOptions
    });
  }

  async requestByDiagnosisChart(payload, id, downloadId) {
    let data = await payload;
    data.data[0].requestByDiagnosis.sort((a, b) => (a.name > b.name) ? 1 : -1);
    let obj = data.data[0].requestByDiagnosis;
    let labels = [];  
    let diagnosisData = [];
    obj.forEach(el=>{
        for(const prop in el){
          if( prop === 'name'){
            labels.push( el[prop] );
          }
          else if ( prop === 'total'){
            diagnosisData.push( el[prop] );
          }
        }
    });

    var doughnutData = {
      labels,
      datasets: [
        {
          data: diagnosisData,
          backgroundColor: ['#0a75ad','#81d8d0','#bada55','#ffd700','#000080','#6897bb','#8b0000','#088da5','#808080','#b4eeb4','#0e2f44','#990000','#daa520','#b6fcd5','#660066','#f6546a','#008000','#c0d6e4','#ff7f50','#ff00ff','#ffdab9','#ff6666','#333333','#00ff00','#cccccc','#fff68f','#f08080','#ffff00','#ffb6c1','#003366','#0000ff','#8a2be2','#ffa500','#ffd700','#e6e6fa','#008080','#ffe4e1','#ffc0cb','#576675','#f7347a']
        }
      ]
    };

    //this.showLabelWithoutHover();
    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },
      //showAllTooltips: true, // call plugin we created
      //cutoutPercentage: 60,
      legend: {
        display: false,
        position: 'left'
      },
      scales: {
        	yAxes: [{
            	ticks: {
                	beginAtZero: true
            	}
        	}]
    	},
      tooltips: {
        enabled: true,
        bodyFontSize: 15,
        bodyFontColor: "#fff",
        backgroundColor: "rgba(0,0,0,0.4)",
        // callbacks: {
        //   title: function (tooltipItems, data) {
        //     return "";
        //   },
        //   label: function (tooltipItem, data) {
        //     var datasetLabel = "";
        //     var label = data.labels[tooltipItem.index];
        //     return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        //   }
        // },
        // intersect: true,
        // mode:'index'
      }
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "bar",
      data: doughnutData,
      options: doughnutOptions
    });
  }

  countUnique(arr) {
    const counts = {};
    for (var i = 0; i < arr.length; i++) {
      counts[arr[i]] = 1 + (counts[arr[i]] || 0);
    }
    return counts;
  }

  async requestLink(reqId) {
    let data = this.form.get();
    let linkId = data._id;
    delete data._id;
    let resData = null;
    if (linkId) {
      resData = await Service.updateRequestLink(reqId, linkId, data);
    } else resData = resData = await Service.addRequestLink(reqId, data);
    if (!resData) return;
    this.form.clear();
    this.fire("request-link-added", resData);
    this.close();
  }

  openEditModal(id) {
    this.open();
    this.loadData(id);
  }

  async loadData(id) {
    let resData = await Service.getRequestLink(id);
    $(`#selectjs`).val(resData.created_for);
    $(`#selectjs`)
      .append(new Option(resData.created_for, resData.created_for, true, true))
      .trigger("change");
    this.form.set(resData);
  }
}

export default RequestChart;
