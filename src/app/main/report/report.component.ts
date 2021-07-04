import { Component, OnInit } from '@angular/core';
import { Chart } from '@antv/g2';

interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  checked = false;
  constructor() {}

  ngOnInit(): void {
    const data = [
      { item: 'Application', count: 39, percent: 0.67 },
      { item: 'Branch', count: 9, percent: 0.3 },
      { item: 'Bank', count: 1, percent: 0.03 },
    ];
    const chart = new Chart({
      container: 'c1',
      autoFit: true,
      height: 200,
    });

    chart.data(data);
    chart.scale('percent', {
      formatter: (val) => {
        val = val * 100 + '%';
        return val;
      },
    });
    chart.coordinate('theta', {
      radius: 0.75,
      innerRadius: 0.6,
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
    });

    chart
      .annotation()
      .text({
        position: ['50%', '50%'],
        content: '200',
        style: {
          fontWeight: 'bolder',
          fontSize: 16,
          fill: '#8c8c8c',
          textAlign: 'center',
        },
        offsetY: -20,
      })
      .text({
        position: ['50%', '50%'],
        content: 'Tickets',
        style: {
          fontSize: 14,
          fill: '#8c8c8c',
          textAlign: 'center',
        },
      })

      .text({
        position: ['50%', '50%'],
        content: 'Sold',
        style: {
          fontSize: 14,
          fill: '#8c8c8c',
          textAlign: 'center',
        },
        offsetY: 20,
        // offsetX: 20,
      });
    chart
      .interval()
      .adjust('stack')
      .position('percent')
      .color('item')
      .label('percent', (percent) => {
        return {
          content: (data) => {
            return `${data.item}: ${percent * 100}%`;
          },
        };
      })
      .tooltip('item*percent', (item, percent) => {
        percent = percent * 100 + '%';
        return {
          name: item,
          value: percent,
        };
      });

    chart.interaction('element-active');

    chart.render();
  }
}
