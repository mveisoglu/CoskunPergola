require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/resimler");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
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
        res.render("home", { data: gelenVeri });
      }
    });
  } catch (error) {
    console.log("HATA", error);
  }
});

//LOGIN//
//Kullanıcı oluşturma//
app.post("/api/kullaniciolusturma", function (req, res) {
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
        successRedirect: "/admin",
        failureRedirect: "/",
        failureFlash: true,
      })(req, res, function () {
        res.redirect("/admin");
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

app.post("/admin/proje/ekle", upload.array("dosya", 50), (req, res) => {
  var resimLinki1 = "";
  var resimLinki2 = "";
  var resimLinki3 = "";
  var resimLinki4 = "";

  try {
    if (req.files.length > 4) throw "Lütfen En Fazla 4 Adet Resim Ekleyin !";
    else if (req.files[0] && req.files[1] && req.files[2] && req.files[3]) {
      resimLinki1 = "../resimler/" + req.files[0].filename;
      resimLinki2 = "../resimler/" + req.files[1].filename;
      resimLinki3 = "../resimler/" + req.files[2].filename;
      resimLinki4 = "../resimler/" + req.files[3].filename;
    } else if (req.files[0] && req.files[1] && req.files[2]) {
      resimLinki1 = "../resimler/" + req.files[0].filename;
      resimLinki2 = "../resimler/" + req.files[1].filename;
      resimLinki3 = "../resimler/" + req.files[2].filename;
      resimLinki4 = "";
    } else if (req.files[0] && req.files[1]) {
      resimLinki1 = "../resimler/" + req.files[0].filename;
      resimLinki2 = "../resimler/" + req.files[1].filename;
      resimLinki3 = "";
      resimLinki4 = "";
    } else if (!req.files[1] && !req.files[2] && !req.files[3]) {
      resimLinki1 = "../resimler/" + req.files[0].filename;
      resimLinki2 = "";
      resimLinki3 = "";
      resimLinki4 = "";
    } else if (
      !req.files[0] &&
      !req.files[1] &&
      !req.files[2] &&
      !req.files[3]
    ) {
      resimLinki1 = "";
      resimLinki2 = "";
      resimLinki3 = "";
      resimLinki4 = "";
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
      },
    });
    ekle.save((err) => {
      if (err) {
        res.redirect("/admin");
      } else {
        res.redirect("/admin");
      }
    });
  } catch (error) {
    res.redirect("/admin");
  }
});

app.get("/admin", async (req, res) => {
  if (req.isAuthenticated()) {
    // eğer giriş yapılmışsa
    try {
      await Proje.find({}, (err, gelenVeri) => {
        if (err) throw err;
        else {
          res.render("admin/adminHome", {
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

app.post("/admin/api/urunsil", async (req, res) => {
  try {
    Proje.deleteOne({ _id: req.body.id }, function (err, gelenVeri) {
      if (!err) {
        res.redirect("/admin");
      } else {
        res.render("admin/adminhome", { isSuccess: false });
      }
    });
  } catch (error) {
    console.log("HATA", error);
  }
});

// ADMIN //

app.listen(5000, () => {
  console.log("Server 5000 portunda çalışıyor");
});
