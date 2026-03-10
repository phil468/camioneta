import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
  ],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('estadoChart') estadoChartRef!: ElementRef;
  @ViewChild('mesChart') mesChartRef!: ElementRef;
  @ViewChild('clientesChart') clientesChartRef!: ElementRef;
  @ViewChild('choferesChart') choferesChartRef!: ElementRef;

  loading = false;
  estadisticas: any = null;

  estadoChart: Chart | null = null;
  mesChart: Chart | null = null;
  clientesChart: Chart | null = null;
  choferesChart: Chart | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  ngAfterViewInit() {
    // Los gráficos se crearán después de cargar los datos
  }

  async cargarEstadisticas() {
    this.loading = true;
    try {
      const response = await this.apiService.getEstadisticas().toPromise();
      if (response?.data) {
        this.estadisticas = response.data;
        setTimeout(() => {
          this.crearGraficos();
        }, 100);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      this.loading = false;
    }
  }

  crearGraficos() {
    this.crearGraficoEstado();
    this.crearGraficoMes();
    this.crearGraficoClientes();
    this.crearGraficoChoferes();
  }

  crearGraficoEstado() {
    if (!this.estadoChartRef || !this.estadisticas?.registros_por_estado)
      return;

    const data = this.estadisticas.registros_por_estado;
    const ctx = this.estadoChartRef.nativeElement.getContext('2d');

    if (this.estadoChart) {
      this.estadoChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Por Aprobar', 'Aprobado', 'Rechazado'],
        datasets: [
          {
            data: [
              data.por_aprobar || 0,
              data.aprobado || 0,
              data.rechazado || 0,
            ],
            backgroundColor: [
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Registros por Estado',
          },
        },
      },
    };

    this.estadoChart = new Chart(ctx, config);
  }

  crearGraficoMes() {
    if (!this.mesChartRef || !this.estadisticas?.registros_por_mes) return;

    const data = this.estadisticas.registros_por_mes;
    const ctx = this.mesChartRef.nativeElement.getContext('2d');

    if (this.mesChart) {
      this.mesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map((item: any) => {
          const [year, month] = item.mes.split('-');
          const monthNames = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
          ];
          return monthNames[parseInt(month) - 1] + ' ' + year;
        }),
        datasets: [
          {
            label: 'Registros',
            data: data.map((item: any) => item.total),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Registros por Mes',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.mesChart = new Chart(ctx, config);
  }

  crearGraficoClientes() {
    if (!this.clientesChartRef || !this.estadisticas?.top_clientes) return;

    const data = this.estadisticas.top_clientes;
    const ctx = this.clientesChartRef.nativeElement.getContext('2d');

    if (this.clientesChart) {
      this.clientesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map((item: any) => item.cliente_codigo),
        datasets: [
          {
            label: 'Registros',
            data: data.map((item: any) => item.total),
            backgroundColor: 'rgba(153, 102, 255, 0.8)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Top 5 Clientes',
          },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                const index = context[0].dataIndex;
                return data[index].cliente_nombre;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.clientesChart = new Chart(ctx, config);
  }

  crearGraficoChoferes() {
    if (!this.choferesChartRef || !this.estadisticas?.top_choferes) return;

    const data = this.estadisticas.top_choferes;
    const ctx = this.choferesChartRef.nativeElement.getContext('2d');

    if (this.choferesChart) {
      this.choferesChart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map((item: any) => item.chofer_nombre),
        datasets: [
          {
            label: 'Registros',
            data: data.map((item: any) => item.total),
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Top 5 Choferes',
          },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                const index = context[0].dataIndex;
                return `${data[index].chofer_nombre} (DNI: ${data[index].chofer_dni})`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.choferesChart = new Chart(ctx, config);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  volver() {
    this.router.navigate(['/home']);
  }

  ionViewWillLeave() {
    // Destruir gráficos al salir de la página
    if (this.estadoChart) this.estadoChart.destroy();
    if (this.mesChart) this.mesChart.destroy();
    if (this.clientesChart) this.clientesChart.destroy();
    if (this.choferesChart) this.choferesChart.destroy();
  }
}
