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
        this.selectNoticias();
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

  selectNoticias(){
    return this.database.executeSql('SELECT * FROM noticia',[]).then(res=>{
      //variable para almacenar el resultado del select
      let items: Noticias[] = [];
      //validar si trae registros
      if(res.rows.length > 0){
        //recorro el cursor para guardar los datos
        for(var i = 0; i < res.rows.length; i++){
          //agrego elementoa elemento en mi arreglo
          items.push({
            idnoticia: res.rows.item(i).idnoticia,
            titulo: res.rows.item(i).titulo,
            texto: res.rows.item(i).texto
          })
        }
      }
      //actualizo el observable
      this.listaNoticias.next(items as any);
    })
  }

  actualizarNoticia(id:string, titulo: string, texto: string){
    return this.database.executeSql('UPDATE noticia SET titulo = ?, texto = ? WHERE idnoticia = ?',[titulo,texto,id]).then(res=>{
      this.presentAlert("Modificar","Noticia ha sido modificada");
      this.selectNoticias();
    }).catch(e=>{
      this.presentAlert('Modificar','Error: ' + JSON.stringify(e));
    })
  }

  insertarNoticia(titulo:string, texto: string){
    return this.database.executeSql('INSERT INTO noticia(titulo, texto) VALUES (?,?)',[titulo,texto]).then(res=>{
      this.presentAlert("Insertar","Noticia Ingresada");
      this.selectNoticias();
    }).catch(e=>{
      this.presentAlert('Insertar','Error: ' + JSON.stringify(e));
    })
  }

  eliminarNoticia(id:string){
    this.database.executeSql('DELETE FROM noticia WHERE idnoticia = ?',[id]).then(res=>{
      this.presentAlert("Eliminar","Noticia Eliminada");
      this.selectNoticias();
    }).catch(e=>{
      this.presentAlert('Eliminar','Error: ' + JSON.stringify(e));
    })
  }

}
