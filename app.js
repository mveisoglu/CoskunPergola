require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const multer = require("multer");
var fs = require("fs");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/resimler");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        file.originalname +
        new Date().getMilliseconds() +
        ".jpg"
    );
  },
});
var upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
//LOGIN İŞLEMLERİ///
app.use(
  session({
    secret: "Coskun-Pergola",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 300000 /*Cookie Süresi */,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
///MONGOOSE///
mongoose
  .connect(process.env.MONGO_BAGLANTI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("MONGOOSE BAŞARILI");
  })
  .catch((err) => {
    console.log("MONGOOSE HATA", err);
  });
const Schema = mongoose.Schema;
///MONGOOSE///
///MONGOOSE ŞEMA///
const projeSchema = new mongoose.Schema({
  title: String,
  content: String,
  projeYeri: String,
  projeTipi: String,
  musteri: String,
  resimler: {
    bir: String,
    iki: String,
    uc: String,
    dort: String,
    bes: String,
    alti: String,
  },
});
// lOGIN SHEMA//
const uyeSemasi = new mongoose.Schema({
  username: String,
  sifre: String,
});
uyeSemasi.plugin(passportLocalMongoose);
///MONGOOSE ŞEMA///
///MONGOOSE MODEL///
const Proje = mongoose.model("Proje", projeSchema);
//uyeSemasi.plugin(encrypt, {secret : process.env.ANAHTAR , encryptedFields  : ['sifre'] });
const Kullanici = new mongoose.model("Kullanici", uyeSemasi);
passport.use(Kullanici.createStrategy());
//*  TARAYICIDA COOKIE OLUŞTURACAĞIZ.         *//
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
//*  TARAYICIDAN ALDIĞIMIZ COOKİ'İ ÇÖZECEĞİZ' *//
passport.deserializeUser(function (id, done) {
  Kullanici.findById(id, function (err, user) {
    done(err, user);
  });
});
///MONGOOSE MODEL///
app.get("/", (req, res) => {
  try {
    Proje.find({}, (err, gelenVeri) => {
      if (err) throw err;
      else {
        res.render("home", {
          data: gelenVeri,
          contact_form: process.env.CONTACT,
        });
      }
    });
  } catch (error) {
    console.log("HATA", error);
  }
});
//LOGIN//
//Kullanıcı oluşturma//
app.post(process.env.KULLANICI_KAYIT, function (req, res) {
  Kullanici.register(
    {
      username: req.body.username,
    },
    //Kayıt için gerekli şifre
    req.body.sifre,
    function (err, gelenVeri) {
      if (err) {
        res.send({ sonuc: "hata" });
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.send({ sonuc: "başarılı" }); //giriş işlemi gerçekleşsin
        });
      }
    }
  );
});
app.post("/girisyap", function (req, res) {
  const kullanici = new Kullanici({
    username: req.body.username,
    sifre: req.body.password,
  });
  req.login(kullanici, function (err) {
    if (err) {
      console.log(err);
      res.render("login/giris.ejs");
    } else {
      passport.authenticate("local", {
        successRedirect: "/cpadmin",
        failureRedirect: "/",
        failureFlash: true,
      })(req, res, function () {
        res.redirect("/cpadmin");
      });
    }
  });
});
//LOGIN BITIS//
//LOG OUT//
app.get("/cikisyap", function (req, res) {
  req.logout();
  res.redirect("/");
});
// ADMIN//
app.post(process.env.URUN_EKLE, upload.array("dosya", 20), (req, res) => {
  var api_ekle = process.env.URUN_EKLE;
  if (req.isAuthenticated()) {
    var resimLinki1 = "";
    var resimLinki2 = "";
    var resimLinki3 = "";
    var resimLinki4 = "";
    var resimLinki5 = "";
    var resimLinki6 = "";
    try {
      if (req.files.length > 6) throw "Lütfen En Fazla 6 Adet Resim Ekleyin !";
      else if (
        req.files[0] &&
        req.files[1] &&
        req.files[2] &&
        req.files[3] &&
        req.files[4] &&
        req.files[5]
      ) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "../resimler/" + req.files[1].filename;
        resimLinki3 = "../resimler/" + req.files[2].filename;
        resimLinki4 = "../resimler/" + req.files[3].filename;
        resimLinki5 = "../resimler/" + req.files[4].filename;
        resimLinki6 = "../resimler/" + req.files[5].filename;
      } else if (
        req.files[0] &&
        req.files[1] &&
        req.files[2] &&
        req.files[3] &&
        req.files[4]
      ) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "../resimler/" + req.files[1].filename;
        resimLinki3 = "../resimler/" + req.files[2].filename;
        resimLinki4 = "../resimler/" + req.files[3].filename;
        resimLinki5 = "../resimler/" + req.files[4].filename;
        resimLinki6 = "";
      } else if (req.files[0] && req.files[1] && req.files[2] && req.files[3]) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "../resimler/" + req.files[1].filename;
        resimLinki3 = "../resimler/" + req.files[2].filename;
        resimLinki4 = "../resimler/" + req.files[3].filename;
        resimLinki5 = "";
        resimLinki6 = "";
      } else if (req.files[0] && req.files[1] && req.files[2]) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "../resimler/" + req.files[1].filename;
        resimLinki3 = "../resimler/" + req.files[2].filename;
        resimLinki4 = "";
        resimLinki5 = "";
        resimLinki6 = "";
      } else if (req.files[0] && req.files[1]) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "../resimler/" + req.files[1].filename;
        resimLinki3 = "";
        resimLinki4 = "";
        resimLinki5 = "";
        resimLinki6 = "";
      } else if (req.files[0]) {
        resimLinki1 = "../resimler/" + req.files[0].filename;
        resimLinki2 = "";
        resimLinki3 = "";
        resimLinki4 = "";
        resimLinki5 = "";
        resimLinki6 = "";
      } else if (
        !req.files[0] &&
        !req.files[1] &&
        !req.files[2] &&
        !req.files[3] &&
        !req.files[5] &&
        !req.files[6]
      ) {
        resimLinki1 = "";
        resimLinki2 = "";
        resimLinki3 = "";
        resimLinki4 = "";
        resimLinki5 = "";
        resimLinki6 = "";
      }
      var ekle = new Proje({
        title: req.body.title,
        content: req.body.content,
        projeYeri: req.body.projeYeri,
        projeTipi: req.body.projeTipi,
        musteri: req.body.musteri,
        resimler: {
          bir: resimLinki1,
          iki: resimLinki2,
          uc: resimLinki3,
          dort: resimLinki4,
          bes: resimLinki5,
          alti: resimLinki6,
        },
      });
      ekle.save((err) => {
        if (err) {
          res.redirect("/cpadmin");
        } else {
          res.redirect("/cpadmin");
        }
      });
    } catch (error) {
      res.redirect("/cpadmin");
    }
  } else {
    res.render("login/giris.ejs");
  }
});
app.get("/cpadmin", async (req, res) => {
  if (req.isAuthenticated()) {
    // eğer giriş yapılmışsa
    try {
      await Proje.find({}, (err, gelenVeri) => {
        if (err) throw err;
        else {
          res.render("admin/adminHome", {
            api_ekle: process.env.URUN_EKLE,
            api_sil: process.env.URUN_SIL,
            data: gelenVeri,
            isSuccess: true,
            msg: "ok",
          });
        }
      });
    } catch (error) {
      res.render("admin/adminhome", { msg: error });
    }
  } else {
    res.render("login/giris.ejs");
  }
});
app.post(process.env.URUN_SIL, async (req, res) => {
  var picture1 = req.body.resim1.split(".");
  var picture2 = req.body.resim2.split(".");
  var picture3 = req.body.resim3.split(".");
  var picture4 = req.body.resim4.split(".");
  var picture5 = req.body.resim5.split(".");
  var picture6 = req.body.resim6.split(".");
  console.log(picture1, "picture1");
  var resim1 = "./public" + picture1[2] + "." + picture1[3] + ".jpg";
  var resim2 = "./public" + picture2[2] + "." + picture2[3] + ".jpg";
  var resim3 = "./public" + picture3[2] + "." + picture3[3] + ".jpg";
  var resim4 = "./public" + picture4[2] + "." + picture4[3] + ".jpg";
  var resim5 = "./public" + picture5[2] + "." + picture5[3] + ".jpg";
  var resim6 = "./public" + picture6[2] + "." + picture6[3] + ".jpg";
  console.log(resim1, "RESİM1");
  var bosArray = [];
  bosArray.push(resim1, resim2, resim3, resim4, resim5, resim6);
  if (req.isAuthenticated()) {
    try {
      for (let i = 0; i < bosArray.length; i++) {
        await fs.unlink(bosArray[i], (err) => {
          if (err) {
            console.log("unlink failed", err);
          } else {
            console.log("file deleted");
          }
        });
      }
      var bosArray = [];
      Proje.deleteOne({ _id: req.body.id }, function (err, gelenVeri) {
        if (!err) {
          res.redirect("/cpadmin");
        } else {
          res.render("admin/adminhome", { isSuccess: false });
        }
      });
    } catch (error) {
      console.log("HATA1234", error);
    }
  } else {
    res.render("login/giris.ejs");
  }
});
// ADMIN //
app.listen(5000, () => {
  console.log("Server 5000 portunda çalışıyor");
});
