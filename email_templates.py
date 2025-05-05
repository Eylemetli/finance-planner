from flask_mail import Message

def create_payment_notification(email, payment_type, name, amount, remaining_budget):
    subject = f"{payment_type.capitalize()} Ödeme Bildirimi"
    body = f"""
    Sayın Kullanıcı,
    
    {name} için {amount} TL tutarındaki ödemeniz başarıyla gerçekleştirilmiştir.
    
    Kalan Bütçe: {remaining_budget} TL
    
    Saygılarımızla,
    Finansal Yönetim Sistemi
    """
    return Message(subject=subject, recipients=[email], body=body)

def create_bill_reminder(email, bill_name, amount, due_date):
    subject = "Fatura Ödeme Hatırlatması"
    body = f"""
    Sayın Kullanıcı,
    
    {bill_name} faturanızın ödeme tarihi yaklaşıyor.
    
    Fatura Tutarı: {amount} TL
    Son Ödeme Tarihi: {due_date}
    
    Lütfen ödemenizi zamanında yapınız.
    
    Saygılarımızla,
    Finansal Yönetim Sistemi
    """
    return Message(subject=subject, recipients=[email], body=body)

def create_low_budget_alert(email, current_budget, threshold):
    subject = "Düşük Bütçe Uyarısı"
    body = f"""
    Sayın Kullanıcı,
    
    Bütçeniz {threshold} TL'nin altına düşmüştür.
    
    Mevcut Bütçe: {current_budget} TL
    
    Lütfen harcamalarınızı kontrol ediniz.
    
    Saygılarımızla,
    Finansal Yönetim Sistemi
    """
    return Message(subject=subject, recipients=[email], body=body) 