import { Modal, Form, Session } from "rumsan-ui";
import Service from "./service";
import config from "../config";

class RequestChart extends Modal {
  constructor(cfg) {
    super(cfg);
    this.registerEvents("chart-load-by-date");
    this.loadCharts();

    this.on("chart-load-by-date", (err, data) => {
      this.loadCharts();
    });
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
    let resData = await Service.getChartRequestDetailsByDates(from_date, to_date);

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
    let resData = await Service.getChartRequestDetails(7);
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
    let resData = await Service.getChartRequestDetails(30);
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
    let call = 0;
    let website = 0;
    let facebook = 0;
    let viber = 0;
    let others = 0;

    await payload.data.map(d => {
      if (d.referred_by === "Direct Call") {
        call += 1;
      } else if (d.referred_by === "Website") {
        website += 1;
      } else if (d.referred_by === "Facebook" || d.referred_by === "Instagram") {
        facebook = facebook + 1;
      } else if (d.referred_by === "Viber" || d.referred_by === "Whatsapp") {
        viber += 1;
      } else if (d.referred_by === "Others") {
        others += 1;
      }
    });

    var doughnutData = {
      labels: ["Call", "FB/Insta", "Viber/whatsapp", "Website", "Others"],
      datasets: [
        {
          data: [call, facebook, viber, website, others],
          backgroundColor: ["#a3e1d4", "#dedede", "#b5b8cf", "#FF0000", "#228B22"]
        }
      ]
    };

    this.showLabelWithoutHover();

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },
      showAllTooltips: true, // call plugin we created
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: false,
        bodyFontSize: 18,
        backgroundColor: "rgba(0,0,0,0)",
        bodyFontColor: "#000",
        callbacks: {
          title: function (tooltipItems, data) {
            return "";
          },
          label: function (tooltipItem, data) {
            var datasetLabel = "";
            var label = data.labels[tooltipItem.index];
            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          }
        }
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
    let bloodbank = 0;
    let donor = 0;
    let both = 0;
    let themselves = 0;
    let others = 0;

    await payload.data.map(d => {
      if (d.request_managed_from === "BloodBank") {
        bloodbank += 1;
      } else if (d.request_managed_from === "Donor") {
        donor += 1;
      } else if (d.request_managed_from === "Both") {
        both += 1;
      } else if (d.request_managed_from === "Themselves") {
        themselves += 1;
      } else if (d.request_managed_from === "Others") {
        others += 1;
      }
    });

    var doughnutData = {
      labels: ["Blood Bank", "Donor", "Blood Bank/Donor", "Themselves", "Others"],
      datasets: [
        {
          data: [bloodbank, donor, both, themselves, others],
          backgroundColor: ["#a3e1d4", "#dedede", "#b5b8cf", "#FF0000", "#228B22"]
        }
      ]
    };

    this.showLabelWithoutHover();

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },
      showAllTooltips: true, // call plugin we created
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: false,
        bodyFontSize: 18,
        bodyFontColor: "#000",
        backgroundColor: "rgba(0,0,0,0)",
        callbacks: {
          title: function (tooltipItems, data) {
            return "";
          },
          label: function (tooltipItem, data) {
            var datasetLabel = "";
            var label = data.labels[tooltipItem.index];
            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          }
        }
      }
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "doughnut",
      data: doughnutData,
      options: doughnutOptions
    });
  }

  async requestByBloodGroupChart(payload, id, downloadId) {
    let oPositive = 0;
    let oNegative = 0;
    let APositive = 0;
    let ANegative = 0;
    let BPositive = 0;
    let BNegative = 0;
    let ABPositive = 0;
    let ABNegative = 0;

    await payload.data.map(d => {
      if (d.blood_group === "O" && d.rh_factor === "+") {
        oPositive += 1;
      } else if (d.blood_group === "O" && d.rh_factor === "-") {
        oNegative += 1;
      } else if (d.blood_group === "A" && d.rh_factor === "+") {
        APositive += 1;
      } else if (d.blood_group === "A" && d.rh_factor === "-") {
        ANegative += 1;
      } else if (d.blood_group === "B" && d.rh_factor === "+") {
        BPositive += 1;
      } else if (d.blood_group === "B" && d.rh_factor === "-") {
        BNegative += 1;
      } else if (d.blood_group === "AB" && d.rh_factor === "+") {
        ABPositive += 1;
      } else if (d.blood_group === "AB" && d.rh_factor === "-") {
        ABNegative += 1;
      }
    });

    var doughnutData = {
      labels: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      datasets: [
        {
          data: [
            oPositive,
            oNegative,
            APositive,
            ANegative,
            BPositive,
            BNegative,
            ABPositive,
            ABNegative
          ],
          backgroundColor: [
            "#a3e1d4",
            "#dedede",
            "#b5b8cf",
            "#FF0000",
            "#228B22",
            "#E7FF33",
            "#FF33EC",
            "#FF9333"
          ]
        }
      ]
    };

    this.showLabelWithoutHover();

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },
      showAllTooltips: true, // call plugin we created
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: false,
        bodyFontSize: 18,
        bodyFontColor: "#000",
        backgroundColor: "rgba(0,0,0,0)",
        callbacks: {
          title: function (tooltipItems, data) {
            return "";
          },
          label: function (tooltipItem, data) {
            var datasetLabel = "";
            var label = data.labels[tooltipItem.index];
            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          }
        }
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
    let diagnosisArray = [];

    await payload.data.map(d => {
      if (d.diagnosis[0]) diagnosisArray.push(d.diagnosis[0].name);
    });

    let diagnosisNames = [];
    let diagnosisValues = [];

    let countedData = this.countUnique(diagnosisArray);
    Object.keys(countedData).forEach(function eachKey(key) {
      diagnosisNames.push(key);
      diagnosisValues.push(countedData[key]);
    });
    var doughnutData = {
      labels: diagnosisNames,
      datasets: [
        {
          data: diagnosisValues,
          backgroundColor: [
            "#a3e1d4",
            "#dedede",
            "#b5b8cf",
            "#FF0000",
            "#228B22",
            "#E7FF33",
            "#FF33EC",
            "#FF9333"
          ]
        }
      ]
    };

    this.showLabelWithoutHover();

    var doughnutOptions = {
      responsive: true,
      animation: {
        onComplete: function () {
          $(`#${downloadId}`).attr("href", myChart.toBase64Image());
        }
      },
      showAllTooltips: true, // call plugin we created
      cutoutPercentage: 60,
      legend: {
        position: "bottom"
      },
      tooltips: {
        enabled: false,
        bodyFontSize: 18,
        bodyFontColor: "#000",
        backgroundColor: "rgba(0,0,0,0)",
        callbacks: {
          title: function (tooltipItems, data) {
            return "";
          },
          label: function (tooltipItem, data) {
            var datasetLabel = "";
            var label = data.labels[tooltipItem.index];
            return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          }
        }
      }
    };

    var ctx4 = document.getElementById(`${id}`).getContext("2d");
    var myChart = new Chart(ctx4, {
      type: "doughnut",
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
