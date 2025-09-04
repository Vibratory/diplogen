"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type, ImageIcon, Save, Trash2, Download, PenTool, FileText, X, CheckCircle, ArrowLeft, Italic, Underline } from "lucide-react"
import { FileUpload } from "./file-upload"
import { CSVProcessor } from "./csv-processor"
import { PDFGenerator } from "./pdf-generator"
import { Toggle } from "@/components/ui/toggle"
import { AlignLeft, AlignCenter, AlignRight, Bold } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DiplomaField {
  id: string
  type: "text" | "image" | "signature"
  title: string
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  color: string
  fontWeight: string
  textAlign: "left" | "center" | "right"
  fontStyle: "normal" | "italic"
  textDecoration: "none" | "underline"
  letterSpacing: number
  lineHeight: number
  textTransform: "none" | "uppercase" | "capitalize"
  rotation: number
  opacity: number
}


// Lightweight font picker with hover preview and dynamic Google Fonts loading
function FontPicker({ value, onChange }: { value: string; onChange: (family: string) => void }) {
  const [open, setOpen] = useState(false)

  const encodeGF = (name: string) => name.trim().replace(/\s+/g, "+")
  const ensureFont = (googleName?: string) => {
    if (!googleName) return
    const id = `gf-${encodeGF(googleName).toLowerCase()}`
    if (document.getElementById(id)) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?family=${encodeGF(googleName)}:wght@400;700&display=swap`
    document.head.appendChild(link)
  }

  const OPTIONS: Array<{ label: string; family: string; google?: string }> = [
    // Generic
    { label: "Serif", family: "serif" },
    { label: "Sans", family: "sans-serif" },
    { label: "Mono", family: "monospace" },
    // Serif (Google + system)
    { label: "Playfair Display", family: "\"Playfair Display\", serif", google: "Playfair Display" },
    { label: "Merriweather", family: "Merriweather, serif", google: "Merriweather" },
    { label: "Lora", family: "Lora, serif", google: "Lora" },
    { label: "Libre Baskerville", family: "\"Libre Baskerville\", serif", google: "Libre Baskerville" },
    { label: "Spectral", family: "Spectral, serif", google: "Spectral" },
    { label: "Cormorant Garamond", family: "\"Cormorant Garamond\", serif", google: "Cormorant Garamond" },
    { label: "Times New Roman", family: "\"Times New Roman\", Times, serif" },
    { label: "Georgia", family: "Georgia, serif" },
    { label: "Garamond", family: "Garamond, serif" },
    // Sans
    { label: "Inter", family: "Inter, sans-serif", google: "Inter" },
    { label: "Roboto", family: "Roboto, sans-serif", google: "Roboto" },
    { label: "Open Sans", family: "\"Open Sans\", sans-serif", google: "Open Sans" },
    { label: "Poppins", family: "Poppins, sans-serif", google: "Poppins" },
    { label: "Montserrat", family: "Montserrat, sans-serif", google: "Montserrat" },
    { label: "Noto Sans", family: "\"Noto Sans\", sans-serif", google: "Noto Sans" },
    { label: "Source Sans 3", family: "\"Source Sans 3\", sans-serif", google: "Source Sans 3" },
    { label: "Arial", family: "Arial, Helvetica, sans-serif" },
    { label: "Helvetica", family: "Helvetica, Arial, sans-serif" },
    { label: "Verdana", family: "Verdana, Geneva, sans-serif" },
    { label: "Tahoma", family: "Tahoma, Geneva, sans-serif" },
    // Mono
    { label: "JetBrains Mono", family: "\"JetBrains Mono\", monospace", google: "JetBrains Mono" },
    { label: "Fira Code", family: "\"Fira Code\", monospace", google: "Fira Code" },
    { label: "Inconsolata", family: "Inconsolata, monospace", google: "Inconsolata" },
    { label: "Source Code Pro", family: "\"Source Code Pro\", monospace", google: "Source Code Pro" },
    { label: "Courier New", family: "\"Courier New\", Courier, monospace" },
  ]

  const current = OPTIONS.find((o) => o.family === value) || OPTIONS[0]

  return (
    <div className="relative" tabIndex={-1}>
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-2 text-xs bg-transparent"
        onClick={() => setOpen((v) => !v)}
        style={{ fontFamily: current.family }}
        title={current.label}
      >
        {current.label}
      </Button>
      {open && (
        <div className="absolute z-[9999] mt-1 w-56 max-h-64 overflow-auto bg-background border border-border rounded shadow pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
          {OPTIONS.map((opt) => (
            <div
              key={opt.label}
              className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer flex items-center justify-between"
              onMouseEnter={() => ensureFont(opt.google)}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                ensureFont(opt.google)
                onChange(opt.family)
                setOpen(false)
              }}
              style={{ fontFamily: opt.family }}
              title={opt.label}
            >
              <span className="truncate">{opt.label}</span>
              <span className="opacity-70 ml-2">AaBb</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface DiplomaEditorProps {
  language?: keyof typeof translations
}

interface TemplateRecord {
  id: string
  uploader?: string
  name: string
  description?: string
  category?: string
  image: string
  approvedBy?: string
  approvedAt?: string
  createdAt?: string
  uses?: number
  generatedDiplomas?: number
}

const translations = {
  en: {
    canvasSize: "Canvas Size",
    width: "Width",
    height: "Height",
    downloadTemplate: "Download Template",
    title: "Title",
    diplomaEditor: "Diploma Editor",
    customize: "Customize your diploma template with drag-and-drop editing",
    design: "Design",
    data: "Data",
    chooseTemplate: "Choose Template",
    uploadTemplate: "Upload Template",
    addElements: "Add Elements",
    addTextField: "Add Text Field",
    addLogo: "Add Logo/Image",
    addSignature: "Add Signature",
    fieldProperties: "Field Properties",
    content: "Content",
    fontSize: "Font Size",
    color: "Color",
    fontFamily: "Font Family",
    fontWeight: "Font Weight",
    fields: "Fields",
    dataFormat: "Data Format Example",
    downloadExample: "Download an example file with the correct format",
    downloadExampleCSV: "Download Example CSV",
    downloadExampleExcel: "Download Example Excel",
    currentFields: "Current fields:",
    generatePDF: "Generate PDF",
    saveTemplate: "Save Template",
    dragToMove: "Drag to move",
    clickToSelect: "Click any field to select and drag to move",
    addText: "Add Text Field",
    addImage: "Add Logo/Image",
    editField: "Field Properties",
    // Inside each language object, add:
    records: "Records",       // or "Registros" in ES, "Enregistrements" in FR, etc.
    loaded: "loaded",         // "cargados", "chargés", etc.
    with: "with",             // "con", "avec", etc.

  },
  es: {
    canvasSize: "Tamaño del Lienzo",
    width: "Ancho",
    height: "Alto",
    downloadTemplate: "Descargar Plantilla",
    title: "Título",
    diplomaEditor: "Editor de Diplomas",
    customize: "Personaliza tu plantilla de diploma con edición de arrastrar y soltar",
    design: "Diseño",
    data: "Datos",
    chooseTemplate: "Elegir Plantilla",
    uploadTemplate: "Subir Plantilla",
    addElements: "Agregar Elementos",
    addTextField: "Agregar Campo de Texto",
    addLogo: "Agregar Logo/Imagen",
    addSignature: "Agregar Firma",
    fieldProperties: "Propiedades del Campo",
    content: "Contenido",
    fontSize: "Tamaño de Fuente",
    color: "Color",
    fontFamily: "Familia de Fuente",
    fontWeight: "Peso de Fuente",
    fields: "Campos",
    records: "Registros",
    loaded: "cargados",
    with: "con",
    dataFormat: "Ejemplo de Formato de Datos",
    downloadExample: "Descargar un archivo de ejemplo con el formato correcto",
    downloadExampleCSV: "Descargar Ejemplo CSV",
    downloadExampleExcel: "Descargar Ejemplo Excel",
    currentFields: "Campos actuales:",
    generatePDF: "Generar PDF",
    saveTemplate: "Guardar Plantilla",
    dragToMove: "Arrastra para mover",
    clickToSelect: "Haz clic en cualquier campo para seleccionar y arrastrar para mover",
    addText: "Agregar Campo de Texto",
    addImage: "Agregar Logo/Imagen",
    editField: "Propiedades del Campo",
  },
  ar: {
    canvasSize: "حجم اللوحة",
    width: "العرض",
    height: "الارتفاع",
    downloadTemplate: "تحميل القالب",
    title: "العنوان",
    diplomaEditor: "محرر الشهادات",
    customize: "خصص قالب شهادتك مع التحرير بالسحب والإفلات",
    design: "التصميم",
    data: "البيانات",
    chooseTemplate: "اختر القالب",
    uploadTemplate: "رفع القالب",
    addElements: "إضافة عناصر",
    addTextField: "إضافة حقل نص",
    addLogo: "إضافة شعار/صورة",
    addSignature: "إضافة توقيع",
    fieldProperties: "خصائص الحقل",
    content: "المحتوى",
    fontSize: "حجم الخط",
    color: "اللون",
    fontFamily: "عائلة الخط",
    fontWeight: "وزن الخط",
    fields: "الحقول",
    records: "سجلات",
    loaded: "تم تحميلها",
    with: "مع",

    dataFormat: "مثال تنسيق البيانات",
    downloadExample: "تحميل ملف مثال بالتنسيق الصحيح",
    downloadExampleCSV: "تحميل مثال CSV",
    downloadExampleExcel: "تحميل مثال Excel",
    currentFields: "الحقول الحالية:",
    generatePDF: "إنشاء PDF",
    saveTemplate: "حفظ القالب",
    dragToMove: "اسحب للتحريك",
    clickToSelect: "انقر على أي حقل للتحديد واسحب للتحريك",
    addText: "إضافة حقل نص",
    addImage: "إضافة شعار/صورة",
    editField: "خصائص الحقل",
  },
  fr: {
    canvasSize: "Taille du Canevas",
    width: "Largeur",
    height: "Hauteur",
    downloadTemplate: "Télécharger le Modèle",
    title: "Titre",
    diplomaEditor: "Éditeur de Diplômes",
    customize: "Personnalisez votre modèle de diplôme avec l'édition par glisser-déposer",
    design: "Design",
    data: "Données",
    chooseTemplate: "Choisir un Modèle",
    uploadTemplate: "Télécharger un Modèle",
    addElements: "Ajouter des Éléments",
    addTextField: "Ajouter un Champ de Texte",
    addLogo: "Ajouter un Logo/Image",
    addSignature: "Ajouter une Signature",
    fieldProperties: "Propriétés du Champ",
    content: "Contenu",
    fontSize: "Taille de Police",
    color: "Couleur",
    fontFamily: "Famille de Police",
    fontWeight: "Poids de Police",
    fields: "Champs",
    records: "Enregistrements",
    loaded: "chargés",
    with: "avec",

    dataFormat: "Exemple de Format de Données",
    downloadExample: "Télécharger un fichier d'exemple avec le bon format",
    downloadExampleCSV: "Télécharger Exemple CSV",
    downloadExampleExcel: "Télécharger Exemple Excel",
    currentFields: "Champs actuels:",
    generatePDF: "Générer PDF",
    saveTemplate: "Sauvegarder le Modèle",
    dragToMove: "Glisser pour déplacer",
    clickToSelect: "Cliquez sur n'importe quel champ pour sélectionner et glisser pour déplacer",
    addText: "Ajouter un Champ de Texte",
    addImage: "Ajouter un Logo/Image",
    editField: "Propriétés du Champ",
  },
  zh: {
    canvasSize: "画布大小",
    width: "宽度",
    height: "高度",
    downloadTemplate: "下载模板",
    title: "标题",
    diplomaEditor: "文凭编辑器",
    customize: "使用拖放编辑自定义您的文凭模板",
    design: "设计",
    data: "数据",
    chooseTemplate: "选择模板",
    uploadTemplate: "上传模板",
    addElements: "添加元素",
    addTextField: "添加文本字段",
    addLogo: "添加标志/图像",
    addSignature: "添加签名",
    fieldProperties: "字段属性",
    content: "内容",
    fontSize: "字体大小",
    color: "颜色",
    fontFamily: "字体系列",
    fontWeight: "字体粗细",
    fields: "字段",
    records: "记录",
    loaded: "已加载",
    with: "带有",

    dataFormat: "数据格式示例",
    downloadExample: "下载正确格式的示例文件",
    downloadExampleCSV: "下载示例CSV",
    downloadExampleExcel: "下载示例Excel",
    currentFields: "当前字段：",
    generatePDF: "生成PDF",
    saveTemplate: "保存模板",
    dragToMove: "拖动移动",
    clickToSelect: "点击任何字段选择并拖动移动",
    addText: "添加文本字段",
    addImage: "添加标志/图像",
    editField: "字段属性",
  },
  ru: {
    canvasSize: "Размер холста",
    width: "Ширина",
    height: "Высота",
    downloadTemplate: "Скачать шаблон",
    title: "Название",
    diplomaEditor: "Редактор Дипломов",
    customize: "Настройте шаблон диплома с помощью редактирования перетаскиванием",
    design: "Дизайн",
    data: "Данные",
    chooseTemplate: "Выбрать Шаблон",
    uploadTemplate: "Загрузить Шаблон",
    addElements: "Добавить Элементы",
    addTextField: "Добавить Текстовое Поле",
    addLogo: "Добавить Логотип/Изображение",
    addSignature: "Добавить Подпись",
    fieldProperties: "Свойства Поля",
    content: "Содержание",
    fontSize: "Размер Шрифта",
    color: "Цвет",
    fontFamily: "Семейство Шрифтов",
    fontWeight: "Толщина Шрифта",
    fields: "Поля",
    records: "Записи",
    loaded: "загружено",
    with: "с",

    dataFormat: "Пример Формата Данных",
    downloadExample: "Скачать пример файла с правильным форматом",
    downloadExampleCSV: "Скачать Пример CSV",
    downloadExampleExcel: "Скачать Пример Excel",
    currentFields: "Текущие поля:",
    generatePDF: "Создать PDF",
    saveTemplate: "Сохранить Шаблон",
    dragToMove: "Перетащите для перемещения",
    clickToSelect: "Нажмите на любое поле для выбора и перетаскивания",
    addText: "Добавить Текстовое Поле",
    addImage: "Добавить Логотип/Изображение",
    editField: "Свойства Поля",
  },
  hi: {
    canvasSize: "कैनवास आकार",
    width: "चौड़ाई",
    height: "ऊंचाई",
    downloadTemplate: "टेम्पलेट डाउनलोड करें",
    title: "शीर्षक",
    diplomaEditor: "डिप्लोमा संपादक",
    customize: "ड्रैग-एंड-ड्रॉप संपादन के साथ अपने डिप्लोमा टेम्प्लेट को कस्टमाइज़ करें",
    design: "डिज़ाइन",
    data: "डेटा",
    chooseTemplate: "टेम्प्लेट चुनें",
    uploadTemplate: "टेम्प्लेट अपलोड करें",
    addElements: "तत्व जोड़ें",
    addTextField: "टेक्स्ट फ़ील्ड जोड़ें",
    addLogo: "लोगो/छवि जोड़ें",
    addSignature: "हस्ताक्षर जोड़ें",
    fieldProperties: "फ़ील्ड गुण",
    content: "सामग्री",
    fontSize: "फ़ॉन्ट आकार",
    color: "रंग",
    fontFamily: "फ़ॉन्ट परिवार",
    fontWeight: "फ़ॉन्ट वजन",
    fields: "फ़ील्ड",
    records: "रिकॉर्ड",
    loaded: "लोड किए गए",
    with: "के साथ",

    dataFormat: "डेटा प्रारूप उदाहरण",
    downloadExample: "सही प्रारूप के साथ उदाहरण फ़ाइल डाउनलोड करें",
    downloadExampleCSV: "उदाहरण CSV डाउनलोड करें",
    downloadExampleExcel: "उदाहरण Excel डाउनलोड करें",
    currentFields: "वर्तमान फ़ील्ड:",
    generatePDF: "PDF बनाएं",
    saveTemplate: "टेम्प्लेट सहेजें",
    dragToMove: "स्थानांतरित करने के लिए खींचें",
    clickToSelect: "चुनने और खींचने के लिए किसी भी फ़ील्ड पर क्लिक करें",
    addText: "टेक्स्ट फ़ील्ड जोड़ें",
    addImage: "लोगो/छवि जोड़ें",
    editField: "फ़ील्ड गुण",
  },
  pt: {
    canvasSize: "Tamanho da Tela",
    width: "Largura",
    height: "Altura",
    downloadTemplate: "Baixar Modelo",
    title: "Título",
    diplomaEditor: "Editor de Diplomas",
    customize: "Personalize seu modelo de diploma com edição de arrastar e soltar",
    design: "Design",
    data: "Dados",
    chooseTemplate: "Escolher Modelo",
    uploadTemplate: "Carregar Modelo",
    addElements: "Adicionar Elementos",
    addTextField: "Adicionar Campo de Texto",
    addLogo: "Adicionar Logo/Imagem",
    addSignature: "Adicionar Assinatura",
    fieldProperties: "Propriedades do Campo",
    content: "Conteúdo",
    fontSize: "Tamanho da Fonte",
    color: "Cor",
    fontFamily: "Família da Fonte",
    fontWeight: "Peso da Fonte",
    fields: "Campos",
    records: "Registros",
    loaded: "carregados",
    with: "com",

    dataFormat: "Exemplo de Formato de Dados",
    downloadExample: "Baixar um arquivo de exemplo com o formato correto",
    downloadExampleCSV: "Baixar Exemplo CSV",
    downloadExampleExcel: "Baixar Exemplo Excel",
    currentFields: "Campos atuais:",
    generatePDF: "Gerar PDF",
    saveTemplate: "Salvar Modelo",
    dragToMove: "Arrastar para mover",
    clickToSelect: "Clique em qualquer campo para selecionar e arrastar para mover",
    addText: "Adicionar Campo de Texto",
    addImage: "Adicionar Logo/Imagem",
    editField: "Propriedades do Campo",
  },
  de: {
    canvasSize: "Leinwandgröße",
    width: "Breite",
    height: "Höhe",
    downloadTemplate: "Vorlage Herunterladen",
    title: "Titel",
    diplomaEditor: "Diplom-Editor",
    customize: "Passen Sie Ihre Diplomvorlage mit Drag-and-Drop-Bearbeitung an",
    design: "Design",
    data: "Daten",
    chooseTemplate: "Vorlage Wählen",
    uploadTemplate: "Vorlage Hochladen",
    addElements: "Elemente Hinzufügen",
    addTextField: "Textfeld Hinzufügen",
    addLogo: "Logo/Bild Hinzufügen",
    addSignature: "Unterschrift Hinzufügen",
    fieldProperties: "Feldeigenschaften",
    content: "Inhalt",
    fontSize: "Schriftgröße",
    color: "Farbe",
    fontFamily: "Schriftfamilie",
    fontWeight: "Schriftstärke",
    fields: "Felder",
    records: "Einträge",
    loaded: "geladen",
    with: "mit",

    dataFormat: "Datenformat-Beispiel",
    downloadExample: "Beispieldatei mit dem richtigen Format herunterladen",
    downloadExampleCSV: "Beispiel CSV Herunterladen",
    downloadExampleExcel: "Beispiel Excel Herunterladen",
    currentFields: "Aktuelle Felder:",
    generatePDF: "PDF Erstellen",
    saveTemplate: "Vorlage Speichern",
    dragToMove: "Zum Verschieben ziehen",
    clickToSelect: "Klicken Sie auf ein beliebiges Feld zum Auswählen und Ziehen zum Verschieben",
    addText: "Textfeld Hinzufügen",
    addImage: "Logo/Bild Hinzufügen",
    editField: "Feldeigenschaften",
  },
  id: {
    canvasSize: "Ukuran Kanvas",
    width: "Lebar",
    height: "Tinggi",
    downloadTemplate: "Unduh Templat",
    title: "Judul",
    diplomaEditor: "Editor Diploma",
    customize: "Sesuaikan template diploma Anda dengan pengeditan drag-and-drop",
    design: "Desain",
    data: "Data",
    chooseTemplate: "Pilih Template",
    uploadTemplate: "Unggah Template",
    addElements: "Tambah Elemen",
    addTextField: "Tambah Field Teks",
    addLogo: "Tambah Logo/Gambar",
    addSignature: "Tambah Tanda Tangan",
    fieldProperties: "Properti Field",
    content: "Konten",
    fontSize: "Ukuran Font",
    color: "Warna",
    fontFamily: "Keluarga Font",
    fontWeight: "Ketebalan Font",
    fields: "Field",
    records: "rekaman",
    loaded: "dimuat",
    with: "dengan",

    dataFormat: "Contoh Format Data",
    downloadExample: "Unduh file contoh dengan format yang benar",
    downloadExampleCSV: "Unduh Contoh CSV",
    downloadExampleExcel: "Unduh Contoh Excel",
    currentFields: "Field saat ini:",
    generatePDF: "Buat PDF",
    saveTemplate: "Simpan Template",
    dragToMove: "Seret untuk memindahkan",
    clickToSelect: "Klik field mana pun untuk memilih dan seret untuk memindahkan",
    addText: "Tambah Field Teks",
    addImage: "Tambah Logo/Gambar",
    editField: "Properti Field",
  },
  tr: {
    canvasSize: "Tuval Boyutu",
    width: "Genişlik",
    height: "Yükseklik",
    downloadTemplate: "Şablonu İndir",
    title: "Başlık",
    diplomaEditor: "Diploma Editörü",
    customize: "Sürükle ve bırak düzenleme ile diploma şablonunuzu özelleştirin",
    design: "Tasarım",
    data: "Veri",
    chooseTemplate: "Şablon Seç",
    uploadTemplate: "Şablon Yükle",
    addElements: "Öğe Ekle",
    addTextField: "Metin Alanı Ekle",
    addLogo: "Logo/Resim Ekle",
    addSignature: "İmza Ekle",
    fieldProperties: "Alan Özellikleri",
    content: "İçerik",
    fontSize: "Font Boyutu",
    color: "Renk",
    fontFamily: "Font Ailesi",
    fontWeight: "Font Kalınlığı",
    fields: "Alanlar",
    records: "kayıt",
    loaded: "yüklendi",
    with: "ile",

    dataFormat: "Veri Formatı Örneği",
    downloadExample: "Doğru formatta örnek dosya indir",
    downloadExampleCSV: "Örnek CSV İndir",
    downloadExampleExcel: "Örnek Excel İndir",
    currentFields: "Mevcut alanlar:",
    generatePDF: "PDF Oluştur",
    saveTemplate: "Şablonu Kaydet",
    dragToMove: "Taşımak için sürükle",
    clickToSelect: "Seçmek için herhangi bir alana tıklayın ve sürükleyin taşımak için",
    addText: "Metin Alanı Ekle",
    addImage: "Logo/Resim Ekle",
    editField: "Alan Özellikleri",
  },
}

const DiplomaEditor = ({ language = "en" }: DiplomaEditorProps) => {
  const [fields, setFields] = useState<DiplomaField[]>([
    {
      id: "1",
      type: "text",
      title: "Name",
      content: "John Doe",
      x: 50,
      y: 40,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
      textAlign: "left",
      fontStyle: "normal",
      textDecoration: "none",
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      rotation: 0,
      opacity: 1,
    },

    {
      id: "2",
      type: "text",
      title: "Degree",
      content: "Bachelor of Science",
      x: 50,
      y: 55,
      width: 300,
      height: 30,
      fontSize: 18,
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
      textAlign: "left",
      fontStyle: "normal",
      textDecoration: "none",
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      rotation: 0,
      opacity: 1,

    },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<string>("/professional-diploma-template.png")
  const [availableTemplates, setAvailableTemplates] = useState<TemplateRecord[]>([
    { id: "local-1", name: "Professional Diploma", image: "/professional-diploma-template.png", description: "Local template", category: "default", createdAt: new Date().toISOString(), uses: 0, generatedDiplomas: 0 },
    { id: "local-2", name: "Classic Diploma", image: "/classic-diploma-template.png", description: "Local template", category: "default", createdAt: new Date().toISOString(), uses: 0, generatedDiplomas: 0 },
    { id: "local-3", name: "Modern Certificate", image: "/modern-clean-certificate.png", description: "Local template", category: "default", createdAt: new Date().toISOString(), uses: 0, generatedDiplomas: 0 },
    { id: "local-4", name: "Elegant Diploma", image: "/elegant-diploma-template.png", description: "Local template", category: "default", createdAt: new Date().toISOString(), uses: 0, generatedDiplomas: 0 },
  ])
  const [bulkData, setBulkData] = useState<{ headers: string[]; records: any[] } | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [dialogView, setDialogView] = useState<"select" | "preview">("select")
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })
  const [dpi, setDpi] = useState<number>(300)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [resizingFieldId, setResizingFieldId] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ startX: 0, startY: 0, startW: 0, startH: 0 })
  const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState<number>(1)
  const [stepDialogOpen, setStepDialogOpen] = useState(false)
  const [stepChoice, setStepChoice] = useState<"single" | "bulk" | null>(null)

  // Compute on-screen display size maintaining aspect ratio, capped at 800x600 without upscaling
  const maxDisplay = { width: 800, height: 600 }
  const displayScale = Math.min(
    1,
    Math.min(maxDisplay.width / canvasDimensions.width, maxDisplay.height / canvasDimensions.height)
  )
  const displayWidth = Math.round(canvasDimensions.width * displayScale)
  const displayHeight = Math.round(canvasDimensions.height * displayScale)

  // Track if we already applied initial font scaling after we know template dimensions
  const initialFontScaleApplied = useRef(false)

  // Compute a sensible default font size so text is readable on first render
  const getDefaultFontSize = useCallback(() => {
    // Aim for around 22px on-screen, never below 18px visually
    const targetScreenPx = 22
    const minScreenPx = 18
    const desired = Math.max(minScreenPx, targetScreenPx)
    // Avoid divide-by-zero; displayScale is <= 1
    const fs = Math.round(desired / Math.max(0.05, displayScale))
    return Math.min(160, Math.max(10, fs))
  }, [displayScale])

  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof translations>(language)
  const t = (key: keyof typeof translations["en"]) => {
    return translations[currentLanguage]?.[key] || translations["en"][key] || (key as string)
  }
  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  // Load stored preferred language (if any)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("preferredLanguage") as keyof typeof translations | null
      if (stored && translations[stored]) {
        setCurrentLanguage(stored)
      }
    } catch {}
  }, [])

  // Persist language preference and notify backend
  useEffect(() => {
    try {
      localStorage.setItem("preferredLanguage", currentLanguage)
      fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: currentLanguage }),
      }).catch(() => {})
    } catch {}
  }, [currentLanguage])
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedField || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = ((e.clientX - dragOffset.x - canvasRect.left) / canvasRect.width) * 100
      const newY = ((e.clientY - dragOffset.y - canvasRect.top) / canvasRect.height) * 100

      const constrainedX = Math.max(0, Math.min(95, newX))
      const constrainedY = Math.max(0, Math.min(95, newY))

      updateField(selectedField, { x: constrainedX, y: constrainedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, selectedField, dragOffset])

  // Resize handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingFieldId) return
      const field = fields.find((f) => f.id === resizingFieldId)
      if (!field) return
      const dx = e.clientX - resizeStart.startX
      const dy = e.clientY - resizeStart.startY
      const newWidth = Math.max(20, Math.round(resizeStart.startW + dx / displayScale))
      const newHeight = Math.max(20, Math.round(resizeStart.startH + dy / displayScale))
      updateField(resizingFieldId, { width: newWidth, height: newHeight })
    }
    const handleMouseUp = () => {
      if (resizingFieldId) setResizingFieldId(null)
    }

    if (resizingFieldId) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [resizingFieldId, resizeStart, displayScale, fields])

  const addField = (type: "text" | "image" | "signature") => {
    const newField: DiplomaField = {
      id: Date.now().toString(),
      type,
      title: type === "text" ? `Field ${fields.length + 1}` : type, // Set default title
      content: type === "text" ? "Sample Text" : "",
      x: 20,
      y: 20,
      width: type === "text" ? 200 : 100,
      height: type === "text" ? 40 : 100,
      fontSize: getDefaultFontSize(),
      fontFamily: "serif",
      color: "#000000",
      fontWeight: "normal",
      textAlign: "left",
      fontStyle: "normal",
      textDecoration: "none",
      letterSpacing: 0,
      lineHeight: 1.2,
      textTransform: "none",
      rotation: 0,
      opacity: 1,

    }
    setFields([...fields, newField])
    setSelectedField(newField.id)
  }

  const updateField = (fieldId: string, updates: Partial<DiplomaField>) => {
    setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId))
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  // Read initial template and mode from URL
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const tpl = searchParams?.get("template")
        const tplToken = searchParams?.get("templateToken")
        const mode = searchParams?.get("mode")
        if (tpl) {
          setSelectedTemplate(decodeURIComponent(tpl))
        } else if (tplToken) {
          const dataUrl = localStorage.getItem(`tpl:${tplToken}`)
          if (dataUrl) {
            try {
              const blob = await (await fetch(dataUrl)).blob()
              const objectUrl = URL.createObjectURL(blob)
              if (!cancelled) setSelectedTemplate(objectUrl)
            } catch {
              if (!cancelled) setSelectedTemplate(dataUrl)
            }
          }
        }
              } catch {}
    }
    init()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  // Step state progression
  useEffect(() => {
    if (selectedTemplate) setCurrentStep(2)
  }, [selectedTemplate])

  useEffect(() => {
    if (!stepDialogOpen) return
    setCurrentStep(dialogView === "preview" ? 4 : 3)
  }, [stepDialogOpen, dialogView])

    // Adapt canvas size to the selected template's intrinsic dimensions
  useEffect(() => {
    if (!selectedTemplate) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const w = (img as any).naturalWidth || img.width
      const h = (img as any).naturalHeight || img.height
      if (w && h) {
        setCanvasDimensions({ width: w, height: h })
      }
    }
    img.onerror = () => {
      // Keep existing canvasDimensions if image fails to load
    }
    img.src = selectedTemplate
  }, [selectedTemplate])

  // One-time scaling of initial text fields once template dimensions are known
  useEffect(() => {
    if (!initialFontScaleApplied.current) {
      const scale = canvasDimensions.width / 800
      if (scale && isFinite(scale) && scale !== 1) {
        setFields((prev) =>
          prev.map((f) =>
            f.type === "text"
              ? { ...f, fontSize: Math.max(12, Math.min(72, Math.round(f.fontSize * scale))) }
              : f,
          ),
        )
      }
      initialFontScaleApplied.current = true
    }
  }, [canvasDimensions.width])

  const handleTemplateUpload = async (file: any) => {
    if (!file) return

    const name: string = (file.name || "").toLowerCase()
    const ext = name.includes(".") ? name.split(".").pop() : ""
    const allowed = ["docx", "pdf", "jpg", "jpeg", "png"]
    if (!ext || !allowed.includes(ext)) {
      alert("Only DOCX, PDF, JPG, JPEG, and PNG files are allowed.")
      return
    }

    let srcUrl: string = file.url || file.publicUrl || file.cdnUrl || file.downloadUrl || file.link || file.path || ""
    if (!srcUrl) return

    // Normalize data URLs to object URLs for cross-origin safety
    if (typeof srcUrl === "string" && srcUrl.startsWith("data:")) {
      try {
        const blob = await (await fetch(srcUrl)).blob()
        srcUrl = URL.createObjectURL(blob)
      } catch {}
    }

    const isImage = ["jpg", "jpeg", "png"].includes(ext) || (file.type || file.mimeType || "").startsWith("image/")

    // Helper to convert arbitrary image URL to a PNG object URL
    const toPngObjectUrl = async (url: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas")
            const w = (img as any).naturalWidth || img.width
            const h = (img as any).naturalHeight || img.height
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (!ctx) return reject(new Error("Canvas not supported"))
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob))
              } else {
                reject(new Error("PNG conversion failed"))
              }
            }, "image/png")
          } catch (e) {
            reject(e)
          }
        }
        img.onerror = (e) => reject(e)
        img.src = url
      })
    }

    if (!isImage) {
      alert("DOCX/PDF cannot be used as a canvas background. Please upload a JPG/PNG image template.")
      return
    }

    let pngUrl: string
    try {
      pngUrl = await toPngObjectUrl(srcUrl)
    } catch {
      // Fallback to original if conversion fails
      pngUrl = srcUrl
    }

    const newTemplate: TemplateRecord = {
      id: `uploaded-${Date.now()}`,
      name: file.name ?? "Uploaded Template",
      description: file.description ?? "",
      category: "user",
      image: pngUrl,
      createdAt: new Date().toISOString(),
      uses: 0,
      generatedDiplomas: 0,
    }
    setAvailableTemplates((prev) => [newTemplate, ...prev])
    setSelectedTemplate(newTemplate.image)
    // Try to persist in backend
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description,
          category: newTemplate.category,
          image: newTemplate.image,
          source: "editor",
          autoApprove: true
        }),
      })
    } catch (err) {
      console.warn("Template save API failed; template kept locally.", err)
    }
  }

  const handleImageUpload = (file: any) => {
    console.log("Image uploaded:", file)
  }

  // Load available templates from database (approved only). Falls back to local list on error.
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates?approved=true", { cache: "no-store" } as RequestInit)
        if (res.ok) {
          const data = await res.json()
          const rows: TemplateRecord[] = (data.templates ?? data ?? []).map((t: any, idx: number) => ({
            id: t.id?.toString?.() ?? `db-${idx}`,
            uploader: t.uploader ?? t.userId ?? t.ownerId,
            name: t.name ?? `Template ${idx + 1}`,
            description: t.description ?? "",
            category: t.category ?? "other",
            image: t.image ?? t.url ?? t.previewUrl ?? "",
            approvedBy: t.approvedBy ?? t.approved_by,
            approvedAt: t.approvedAt ?? t.approved_at,
            createdAt: t.createdAt ?? t.created_at,
            uses: t.uses ?? t.use_count ?? 0,
            generatedDiplomas: t.generatedDiplomas ?? t.generated_count ?? 0,
          }))
          if (rows.length) {
            setAvailableTemplates(rows)
          }
        }
      } catch (err) {
        console.warn("Failed to load templates from API, using local defaults.", err)
      }
    }
    fetchTemplates()
  }, [])

  // Track live visitors heartbeat for admin real-time count
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        fetch("/api/visitors/heartbeat", { method: "POST" }).catch(() => {})
      } catch {}
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Track template "use" when selection changes
  useEffect(() => {
    if (!selectedTemplate) return
    try {
      fetch("/api/templates/track-use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateImage: selectedTemplate }),
      }).catch(() => {})
    } catch {}
  }, [selectedTemplate])

  const handleDataProcessed = (data: { headers: string[]; records: any[] }) => {
    setBulkData(data)
    const updatedFields = fields.map((field) => {
      if (field.type === "text" && data.headers.includes(field.title)) {
        return field
      }
      return field
    })
    setFields(updatedFields)
    console.log("Data processed and set:", data)
  }

  const selectedFieldData = fields.find((f) => f.id === selectedField)

  const sampleSingleData = {
    Name: "John Doe",
    Degree: "Bachelor of Computer Science",
    Date: "May 15, 2024",
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, fieldId: string) => {
      e.preventDefault()
      e.stopPropagation()

      const field = fields.find((f) => f.id === fieldId)
      if (!field || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const fieldElement = e.currentTarget as HTMLElement
      const fieldRect = fieldElement.getBoundingClientRect()

      setIsDragging(true)
      setSelectedField(fieldId)
      setDragOffset({
        x: e.clientX - fieldRect.left,
        y: e.clientY - fieldRect.top,
      })
    },
    [fields],
  )

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return
    setResizingFieldId(fieldId)
    setResizeStart({ startX: e.clientX, startY: e.clientY, startW: field.width, startH: field.height })
  }

  const generateExampleCSV = () => {
    const headers = fields.filter((f) => f.type === "text").map((f) => f.title)
    const exampleData = [headers, headers.map(() => "Sample Data"), headers.map(() => "Example Entry")]

    const csvContent = exampleData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diploma-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateExampleExcel = () => {
    const headers = fields.filter((f) => f.type === "text").map((f) => f.title)
    const exampleData = [headers, headers.map(() => "Sample Data"), headers.map(() => "Example Entry")]

    // Simple Excel-like format (TSV)
    const excelContent = exampleData.map((row) => row.join("\t")).join("\n")
    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diploma-template.xlsx"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Handle generation click and track statistics
  const handleGenerateClick = () => {
      setDialogView("preview")
      setStepDialogOpen(true)

    try {
      const count = bulkData?.records?.length ? bulkData.records.length : 1
      fetch("/api/templates/track-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateImage: selectedTemplate, count }),
      }).catch(() => {})
      fetch("/api/users/track-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, templateImage: selectedTemplate }),
      }).catch(() => {})
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">{t("diplomaEditor")}</h1>
          <div className="flex items-center gap-2">
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value as keyof typeof translations)}
              className="h-8 text-xs border rounded px-2 bg-transparent"
            >
              {Object.keys(translations).map((lng) => (
                <option key={lng} value={lng}>
                  {lng.toUpperCase()}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs bg-transparent">
              <Save className="h-3 w-3 mr-1" />
              {t("saveTemplate")}
            </Button>
          </div>
        </div>
      <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[140px]">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${currentStep >= 1 ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"}`}>1</div>
                <div className="text-xs mt-1">Upload or Pick Template</div>
              </div>
              <div className={`flex-1 h-0.5 ${currentStep > 1 ? "bg-primary" : "bg-border"}`}></div>
              <div className="flex flex-col items-center min-w-[140px]">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${currentStep >= 2 ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"}`}>2</div>
                <div className="text-xs mt-1">Edit Diploma</div>
              </div>
              <div className={`flex-1 h-0.5 ${currentStep > 2 ? "bg-primary" : "bg-border"}`}></div>
              <div className="flex flex-col items-center min-w-[140px]">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${currentStep >= 3 ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"}`}>3</div>
                <div className="text-xs mt-1">Pick Single or Bulk</div>
              </div>
              <div className={`flex-1 h-0.5 ${currentStep > 3 ? "bg-primary" : "bg-border"}`}></div>
              <div className="flex flex-col items-center min-w-[140px]">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${currentStep >= 4 ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border"}`}>4</div>
                <div className="text-xs mt-1">Download Diplomas</div>
              </div>
            </div>
          </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div
          className="w-80 border-r border-border bg-muted/30 flex flex-col"
          style={{ height: "calc(100vh - 128px)" }}
        >
          <div className="flex-1 overflow-y-auto">
          <Tabs value="design" className="w-full">
            <TabsList className="grid w-full grid-cols-1 m-2">
              <TabsTrigger value="design" className="text-xs">
                {t("design")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="p-4 space-y-4">
              {/* Canvas Dimensions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("canvasSize")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">{t("width")}</label>
                      <Input
                        type="number"
                        value={canvasDimensions.width}
                        onChange={(e) =>
                          setCanvasDimensions((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 800 }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t("height")}</label>
                      <Input
                        type="number"
                        value={canvasDimensions.height}
                        onChange={(e) =>
                          setCanvasDimensions((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 600 }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">DPI</label>
                    <Input
                      type="number"
                      value={dpi}
                      onChange={(e) => setDpi(Number.parseInt(e.target.value) || 300)}
                      className="h-8 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Elements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("addElements")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => addField("text")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <Type className="h-3 w-3 mr-2" />
                    {t("addTextField")}
                  </Button>
                  <Button
                    onClick={() => addField("image")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <ImageIcon className="h-3 w-3 mr-2" />
                    {t("addLogo")}
                  </Button>
                  <Button
                    onClick={() => addField("signature")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                  >
                    <PenTool className="h-3 w-3 mr-2" />
                    {t("addSignature")}
                  </Button>
                </CardContent>
              </Card>

              {/* Field Management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {t("fields")} ({fields.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedField === field.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {field.type === "text" && <Type className="h-3 w-3" />}
                          {field.type === "image" && <ImageIcon className="h-3 w-3" />}
                          {field.type === "signature" && <PenTool className="h-3 w-3" />}
                          <span className="text-xs font-medium">{field.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(field.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {field.type === "text" && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{field.content}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Field Properties */}
              {selectedField && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t("fieldProperties")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const field = fields.find((f) => f.id === selectedField)
                      if (!field) return null

                      return (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground">{t("title")}</label>
                            <Input
                              value={field.title}
                              onChange={(e) => updateField(selectedField, { title: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="Field title for CSV mapping"
                            />
                          </div>

                          {field.type === "text" && (
                            <>
                              <div>
                                <label className="text-xs text-muted-foreground">{t("content")}</label>
                                <Input
                                  value={field.content}
                                  onChange={(e) => updateField(selectedField, { content: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>

                              {/* font size + color */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">{t("fontSize")}</label>
                                  <Input
                                    type="number"
                                    value={field.fontSize}
                                    onChange={(e) =>
                                      updateField(selectedField, { fontSize: Number.parseInt(e.target.value) || 16 })
                                    }
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">{t("color")}</label>
                                  <Input
                                    type="color"
                                    value={field.color}
                                    onChange={(e) => updateField(selectedField, { color: e.target.value })}
                                    className="h-8 p-1"
                                  />
                                </div>
                              </div>

                              {/* ✅ new row for bold + align */}
                              <div className="flex items-center gap-2">
                                {/* Bold toggle */}
                                <Toggle
                                  pressed={field.fontWeight === "bold"}
                                  onPressedChange={() =>
                                    updateField(selectedField, {
                                      fontWeight: field.fontWeight === "bold" ? "normal" : "bold",
                                    })
                                  }
                                >
                                  <Bold className="w-4 h-4" />
                                </Toggle>
                                {/* Italic toggle */}
                                <Toggle
                                  pressed={field.fontStyle === "italic"}
                                  onPressedChange={() =>
                                    updateField(selectedField, {
                                      fontStyle: field.fontStyle === "italic" ? "normal" : "italic",
                                    })
                                  }
                                >
                                  <Italic className="w-4 h-4" />
                                </Toggle>
                                {/* Underline toggle */}
                                <Toggle
                                  pressed={field.textDecoration === "underline"}
                                  onPressedChange={() =>
                                    updateField(selectedField, {
                                      textDecoration: field.textDecoration === "underline" ? "none" : "underline",
                                    })
                                  }
                                >
                                  <Underline className="w-4 h-4" />
                                </Toggle>

                                {/* Align buttons */}
                                <Button
                                  size="icon"
                                  variant={field.textAlign === "left" ? "default" : "outline"}
                                  onClick={() => updateField(selectedField, { textAlign: "left" })}
                                >
                                  <AlignLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant={field.textAlign === "center" ? "default" : "outline"}
                                  onClick={() => updateField(selectedField, { textAlign: "center" })}
                                >
                                  <AlignCenter className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant={field.textAlign === "right" ? "default" : "outline"}
                                  onClick={() => updateField(selectedField, { textAlign: "right" })}
                                >
                                  <AlignRight className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Advanced text options */}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">Letter Spacing (px)</label>
                                  <Input
                                    type="number"
                                    value={field.letterSpacing}
                                    onChange={(e) => updateField(selectedField, { letterSpacing: Number.parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Line Height</label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={field.lineHeight}
                                    onChange={(e) => updateField(selectedField, { lineHeight: Number.parseFloat(e.target.value) || 1 })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">Rotation (deg)</label>
                                  <Input
                                    type="number"
                                    value={field.rotation}
                                    onChange={(e) => updateField(selectedField, { rotation: Number.parseFloat(e.target.value) || 0 })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Opacity (0-1)</label>
                                  <Input
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={field.opacity}
                                    onChange={(e) => updateField(selectedField, { opacity: Math.min(1, Math.max(0, Number.parseFloat(e.target.value))) })}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="mt-2">
                                <label className="text-xs text-muted-foreground">Text Transform</label>
                                <select
                                  value={field.textTransform}
                                  onChange={(e) => updateField(selectedField, { textTransform: e.target.value as any })}
                                  className="h-8 text-xs border border-border rounded px-1 w-full"
                                >
                                  <option value="none">None</option>
                                  <option value="uppercase">UPPERCASE</option>
                                  <option value="capitalize">Capitalize</option>
                                </select>
                              </div>
                            </>
                          )}
                        </>
                      )
                    })()}
                  </CardContent>

                </Card>
              )}
            </TabsContent>

                      </Tabs>
          </div>
          <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-muted/50 p-3">
            <Button onClick={() => { setDialogView("select"); setStepDialogOpen(true) }} size="sm" className="w-full">
              Next step
            </Button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <div className="sticky top-32 space-y-4">
              <div
                ref={canvasRef}
                className="relative bg-white border-2 border-dashed border-gray-300 mx-auto shadow-lg"
                onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedField(null) } }}
                style={{
                  width: `${displayWidth}px`, // Maintain aspect ratio within max bounds
                  height: `${displayHeight}px`, // Maintain aspect ratio within max bounds
                  backgroundImage: `url(${selectedTemplate})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`absolute transition-all group ${selectedField === field.id
                      ? "border-2 border-primary border-dashed"
                      : "border-2 border-transparent hover:border-primary/50"
                      } ${isDragging && selectedField === field.id ? "cursor-grabbing" : "cursor-grab"}`}
                    style={{
                      left: `${(field.x / 100) * displayWidth}px`,
                      top: `${(field.y / 100) * displayHeight}px`,
                      width: `${field.width * displayScale}px`,
                      height: `${field.height * displayScale}px`,
                    }}
                    onClick={() => setSelectedField(field.id)}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                  >
                    {field.type === "text" && (
                      <div
                        className="w-full h-full flex items-center justify-center text-center relative"
                        style={{
                          fontSize: `${field.fontSize * displayScale}px`,
                          fontFamily: field.fontFamily,
                          color: field.color,
                          fontWeight: field.fontWeight,
                          fontStyle: field.fontStyle,
                          textDecoration: field.textDecoration,
                          letterSpacing: `${field.letterSpacing * displayScale}px`,
                          lineHeight: field.lineHeight,
                          textTransform: field.textTransform,
                          textAlign: field.textAlign,
                          transform: `rotate(${field.rotation}deg)`,
                          opacity: field.opacity,
                          width: `${field.width * displayScale}px`,
                          display: "flex",
                          justifyContent:
                            field.textAlign === "left"
                              ? "flex-start"
                              : field.textAlign === "center"
                                ? "center"
                                : "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {field.content}
                        {selectedField === field.id && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border border-border rounded-md px-2 py-1 shadow-md flex items-center gap-2 text-xs z-[200]"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <Input
                              type="number"
                              value={field.fontSize}
                              onChange={(e) =>
                                updateField(field.id, { fontSize: Number.parseInt(e.target.value) || 16 })
                              }
                              className="w-12 h-6 text-xs p-1"
                              min="8"
                              max="200"
                            />
                            <div className="w-40">
                              <FontPicker
                                value={field.fontFamily}
                                onChange={(fam) => updateField(field.id, { fontFamily: fam })}
                              />
                            </div>
                            <Toggle
                              pressed={field.fontWeight === "bold"}
                              onPressedChange={() =>
                                updateField(field.id, {
                                  fontWeight: field.fontWeight === "bold" ? "normal" : "bold",
                                })
                              }
                              className="h-6 w-6"
                            >
                              <Bold className="w-4 h-4" />
                            </Toggle>
                            <Input
                              type="color"
                              value={field.color}
                              onChange={(e) => updateField(field.id, { color: e.target.value })}
                              className="h-6 w-6 p-0"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {field.type === "image" && (
                      <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        {field.content ? (
                          <img
                            src={field.content || "/placeholder.svg"}
                            alt="Uploaded"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <FileUpload
                            type="image"
                            accept="image/jpeg,image/png"
                            onUploadComplete={(file) => updateField(field.id, { content: file.url })}
                            onUploadError={(error) => console.error("Image upload error:", error)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className="absolute right-0 bottom-0 w-3 h-3 bg-primary rounded-sm cursor-se-resize opacity-80"
                      onMouseDown={(e) => handleResizeMouseDown(e, field.id)}
                      style={{ transform: "translate(50%, 50%)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Templates */}
          <div
            className="w-80 border-l border-border bg-muted/30 overflow-y-auto"
            style={{ height: "calc(100vh - 128px)" }}
          >
            <div className="p-4 space-y-4">
              {/* Template Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("chooseTemplate")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableTemplates.map((template, index) => (
                      <div
                        key={template.id ?? index}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${selectedTemplate === template.image ? "border-primary" : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => setSelectedTemplate(template.image)}
                      >
                        <img
                          src={template.image || "/placeholder.svg"}
                          alt={template.name || `Template ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                          {template.name}
                          {typeof template.uses === "number" && (
                            <span className="ml-1 opacity-80">• {template.uses} uses</span>
                          )}
                        </div>
                        {selectedTemplate === template.image && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("uploadTemplate")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    type="template"
                    accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/jpeg,image/png"
                    onUploadComplete={handleTemplateUpload}
                    onUploadError={(error) => console.error("Template upload error:", error)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Step selection modal */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div style={{ display: dialogView === "preview" ? "none" : "block" }}>
          <DialogHeader>
            <DialogTitle>Next step</DialogTitle>
            <DialogDescription>Choose to generate a single diploma with the entered information or generate in bulk from a list.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant={stepChoice === "single" ? "default" : "outline"} onClick={() => setStepChoice("single")}>Single diploma</Button>
            <Button variant={stepChoice === "bulk" ? "default" : "outline"} onClick={() => setStepChoice("bulk")}>Bulk from list</Button>
          </div>

          {stepChoice === "single" && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">We will generate a PDF using the current fields on the canvas.</p>
              <Button onClick={handleGenerateClick}>Preview & Download</Button>
            </div>
          )}

          {stepChoice === "bulk" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="bg-transparent" onClick={generateExampleExcel}>
                  Download example XLSX
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={generateExampleCSV}>
                  Download example CSV
                </Button>
              </div>
              <CSVProcessor onDataProcessed={handleDataProcessed} />
              {bulkData && (
                <p className="text-xs text-muted-foreground">
                  {bulkData.records.length} records loaded with {bulkData.headers.join(", ")}
                </p>
              )}
              <Button onClick={handleGenerateClick} disabled={!bulkData || !bulkData.records || bulkData.records.length === 0}>
                Continue to preview
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setStepDialogOpen(false)}>Close</Button>
          </DialogFooter>
          </div>

          {/* Preview view */}
          <div style={{ display: dialogView === "preview" ? "block" : "none" }}>
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setDialogView("select")} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Preview</DialogTitle>
            </div>
            <div className="p-0">
              {(() => {
                const single = fields.reduce((acc, field) => {
                  if (field.type === "text") acc[field.title] = field.content
                  return acc
                }, {} as Record<string, string>)
                const headers = fields.filter(f => f.type === "text").map(f => f.title)
                const effectiveBulk = (stepChoice === "bulk" && bulkData && bulkData.records && bulkData.records.length > 0)
                  ? bulkData
                  : { headers, records: [single] }
                return (
                  <PDFGenerator
                    template={selectedTemplate}
                    fields={fields}
                    bulkData={effectiveBulk}
                    singleData={single}
                    canvasDimensions={canvasDimensions}
                    displayDimensions={{ width: displayWidth, height: displayHeight }}
                    dpi={dpi}
                  />
                )
              })()}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStepDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

          </div>
  )
}

export { DiplomaEditor }
export default DiplomaEditor
