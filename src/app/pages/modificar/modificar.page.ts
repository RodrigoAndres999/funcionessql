import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.page.html',
  styleUrls: ['./modificar.page.scss'],
})
export class ModificarPage implements OnInit {
  noticia: any;

  constructor(private router: Router, private activedroute: ActivatedRoute, private bd: ServicebdService) {
    this.activedroute.queryParams.subscribe(res=>{
      if(this.router.getCurrentNavigation()?.extras.state){
        this.noticia = this.router.getCurrentNavigation()?.extras?.state?.['noticiaEnviada'];
      }
    })
   }

  ngOnInit() {
  }
  modificar(){
    this.bd.actualizarNoticia(this.noticia.idnoticia,this.noticia.titulo, this.noticia.texto);
  }

}
