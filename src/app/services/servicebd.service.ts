import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //variable de conexión a la base de datos
  public database!: SQLiteObject;

  //variables para las tablas
  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";

  //variables para insert iniciales
  registroNoticas: string = "INSERT or IGNORE INTO noticia(idnoticia, titulo, texto) VALUES (1,'Soy un titulo de noticia', 'Soy el contenido completo de la noticia que se está insertando');";

  //variables para observables de las consultas en BD
  listaNoticias = new BehaviorSubject([]);

  //variable para observable de estado de la Base de Datos
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor(private sqlite: SQLite, private platform: Platform, private alertController: AlertController) {
    this.crearBD();
   }

  fetchNoticias(): Observable<Noticias[]>{
    return this.listaNoticias.asObservable();
  }

  dbState(){
    return this.isDbReady.asObservable();
  }

  async presentAlert(titulo:string, msj:string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  crearBD(){
    //verificar si la plataforma esta lista o no
    this.platform.ready().then(()=>{
      //creamos la base de datos
      this.sqlite.create({
        name: 'bdnoticias.db',
        location: 'default'
      }).then((bd: SQLiteObject)=>{
        //guardar la conexion
        this.database = bd;
        //llamar a la creación de tablas
        this.crearTablas();
        //modificar el estado de mi base de datos
        this.isDbReady.next(true);
      }).catch(e=>{
        this.presentAlert('Creación de BD','Error: ' + JSON.stringify(e));
      })
    })
  }

  async crearTablas(){
    try{
      await this.database.executeSql(this.tablaNoticia, []);

      await this.database.executeSql(this.registroNoticas, []);

    }catch(e){
      this.presentAlert('Creación de Tablas','Error: ' + JSON.stringify(e));
    }
  }


}
