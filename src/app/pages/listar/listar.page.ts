import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.page.html',
  styleUrls: ['./listar.page.scss'],
})
export class ListarPage implements OnInit {
  arregloNoticias: any = [
    {
      id: '',
      titulo: '',
      texto: ''
    }
  ]

  constructor(private bd: ServicebdService, private router: Router) { }

  ngOnInit() {
    //verificar el estado de la base de datos
    this.bd.dbState().subscribe(res=>{
      if(res){
        //subscribirme al observable del select
        this.bd.fetchNoticias().subscribe(data=>{
          this.arregloNoticias = data;
        })
      }
    })
  }

  modificar(x:any){
    let navigationExtras: NavigationExtras = {
      state: {
        noticiaEnviada: x
      }
    }
    this.router.navigate(['/modificar'], navigationExtras);
  }
  irAgregar(){
    this.router.navigate(['/agregar']);
  }
  eliminar(x:any){
    this.bd.eliminarNoticia(x.idnoticia);
  }

}
